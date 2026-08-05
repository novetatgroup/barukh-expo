import { getPayoutCountryConfig } from "@/constants/payout";
import { AuthContext } from "@/context/AuthContext";
import { bankService, SupportedBank } from "@/services/bankService";
import { getPaymentExecutionMode } from "@/services/paymentConfig";
import { MOCK_PAYOUTS, paymentMockService } from "@/services/paymentMockService";
import { paymentService } from "@/services/paymentService";
import { MaskedBankAccount, PayoutCountry } from "@/types/payment";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type PayoutFormState = {
  country: PayoutCountry;
  bankId: string;
  bankCode: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  isDefault: boolean;
};

const emptyForm = (): PayoutFormState => ({
  country: "Uganda",
  bankId: "",
  bankCode: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  isDefault: false,
});

export const usePayoutAccounts = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const mode = getPaymentExecutionMode();
  const [accounts, setAccounts] = useState<MaskedBankAccount[]>([]);
  const [form, setForm] = useState<PayoutFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [supportedBanks, setSupportedBanks] = useState<SupportedBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState<string | null>(null);

  const bankCacheRef = useRef<Record<string, SupportedBank[]>>({});
  const bankRequestVersionRef = useRef(0);
  const countryConfig = useMemo(() => getPayoutCountryConfig(form.country), [form.country]);

  const load = useCallback(async () => {
    if (!userId || mode !== "mock") {
      setAccounts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setAccounts(await paymentMockService.getBankAccounts(userId));
    setLoading(false);
  }, [mode, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const loadSupportedBanks = useCallback(
    async (country: PayoutCountry, force = false) => {
      const config = getPayoutCountryConfig(country);
      const requestVersion = ++bankRequestVersionRef.current;
      const cached = bankCacheRef.current[config.countryCode];

      if (cached && !force) {
        setSupportedBanks(cached);
        setBanksError(null);
        setBanksLoading(false);
        return;
      }

      setSupportedBanks([]);
      setBanksError(null);

      if (!accessToken) {
        setBanksError("Your session is unavailable. Please log in again.");
        setBanksLoading(false);
        return;
      }

      setBanksLoading(true);
      const result = await bankService.getSupportedBanks(config.countryCode, accessToken);

      if (requestVersion !== bankRequestVersionRef.current) {
        return;
      }

      if (!result.ok || !result.data) {
        setBanksError(result.error || `Unable to load supported banks for ${country}.`);
        setBanksLoading(false);
        return;
      }

      bankCacheRef.current[config.countryCode] = result.data.data;
      setSupportedBanks(result.data.data);
      setBanksError(null);
      setBanksLoading(false);
    },
    [accessToken],
  );

  useEffect(() => {
    if (formVisible) {
      void loadSupportedBanks(form.country);
    }
  }, [form.country, formVisible, loadSupportedBanks]);

  const updateField = <K extends keyof PayoutFormState>(
    field: K,
    value: PayoutFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const updateCountry = (country: PayoutCountry) => {
    bankRequestVersionRef.current += 1;
    setSupportedBanks([]);
    setBanksError(null);
    setForm((current) => ({
      ...current,
      country,
      bankId: "",
      bankCode: "",
      bankName: "",
    }));
    setError(null);
    setSuccess(null);
  };

  const selectBank = (bank: SupportedBank) => {
    setForm((current) => ({
      ...current,
      bankId: bank.id,
      bankCode: bank.code,
      bankName: bank.name,
    }));
    setError(null);
    setSuccess(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setSuccess(null);
    setFormVisible(true);
  };

  const openEdit = (account: MaskedBankAccount) => {
    if (mode !== "mock") return;
    setEditingId(account.id);
    setForm({
      country: account.country,
      bankId: `existing:${account.bankName}`,
      bankCode: "",
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: "",
      isDefault: account.isDefault,
    });
    setError(null);
    setSuccess(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    bankRequestVersionRef.current += 1;
    setForm((current) => ({ ...current, accountNumber: "" }));
    setFormVisible(false);
    setEditingId(null);
    setSupportedBanks([]);
    setBanksError(null);
    setBanksLoading(false);
  };

  const submit = async () => {
    if (submitting) return;
    const accountNumber = form.accountNumber.replace(/\s/g, "");
    if (!form.accountHolderName.trim() || !form.bankId || !form.bankName) {
      setError("Account holder and a supported bank are required.");
      return;
    }
    if ((!editingId || accountNumber) && !/^\d{6,24}$/.test(accountNumber)) {
      setError("Account number must contain 6 to 24 digits.");
      return;
    }
    if (!userId) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        if (mode !== "mock") {
          setError("Bank-account update is disabled until the backend method is confirmed.");
          return;
        }
        console.log("Updating bank account fixture for development:", {
          userId,
          id: editingId,
          country: form.country,
          currency: countryConfig.currency,
          bankName: form.bankName,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          isDefault: form.isDefault,
        });
        await paymentMockService.saveBankAccount(userId, {
          id: editingId,
          country: form.country,
          currency: countryConfig.currency,
          bankName: form.bankName,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          isDefault: form.isDefault,
        });
        setSuccess("Development account fixture updated.");
        await load();
        setFormVisible(false);
        return;
      }

      if (!accessToken) {
        setError("Your session is unavailable. Please log in again.");
        return;
      }

      const result = await paymentService.createBankAccount(
        {
          userId,
          country: form.country,
          currency: countryConfig.currency,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          bankName: form.bankName,
          isDefault: form.isDefault,
        },
        accessToken,
      );

      if (!result.ok) {
        setError(result.error || "Unable to create the payout account.");
        return;
      }

      if (mode === "mock") {
        await paymentMockService.saveBankAccount(userId, {
          id: result.data?.bankAccountId || result.data?.id,
          country: form.country,
          currency: countryConfig.currency,
          bankName: form.bankName,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          isDefault: form.isDefault || accounts.length === 0,
        });
        await load();
      }
      setSuccess("Payout account created by the payment API.");
      setFormVisible(false);
    } finally {
      setForm((current) => ({ ...current, accountNumber: "" }));
      setSubmitting(false);
    }
  };

  const setDefault = async (accountId: string) => {
    if (mode !== "mock" || !userId) return;
    await paymentMockService.setDefaultBankAccount(userId, accountId);
    setSuccess("Development default account updated.");
    setError(null);
    await load();
  };

  const deleteAccount = async (accountId: string) => {
    if (mode !== "mock" || !userId) return;
    await paymentMockService.deleteBankAccount(userId, accountId);
    setSuccess("Development account fixture deleted.");
    setError(null);
    await load();
  };

  return {
    mode,
    accounts,
    payouts: mode === "mock" ? MOCK_PAYOUTS : [],
    loading,
    submitting,
    error,
    success,
    form,
    formVisible,
    editingId,
    currency: countryConfig.currency,
    supportedBanks,
    banksLoading,
    banksError,
    updateField,
    updateCountry,
    selectBank,
    retrySupportedBanks: () => loadSupportedBanks(form.country, true),
    openCreate,
    openEdit,
    setDefault,
    deleteAccount,
    closeForm,
    submit,
    back: () => router.back(),
  };
};
