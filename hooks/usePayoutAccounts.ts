import { PAYOUT_COUNTRIES, getPayoutCountryConfig } from "@/constants/payout";
import { AuthContext } from "@/context/AuthContext";
import { getPaymentExecutionMode } from "@/services/paymentConfig";
import { MOCK_PAYOUTS, paymentMockService } from "@/services/paymentMockService";
import { paymentService } from "@/services/paymentService";
import { MaskedBankAccount, PayoutCountry } from "@/types/payment";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";

type PayoutFormState = {
  country: PayoutCountry;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  swiftCode: string;
  routingNumber: string;
  sortCode: string;
  branchCode: string;
  isDefault: boolean;
};

const emptyForm = (): PayoutFormState => ({
  country: "Uganda",
  bankName: PAYOUT_COUNTRIES[0].banks[0],
  accountHolderName: "",
  accountNumber: "",
  swiftCode: "",
  routingNumber: "",
  sortCode: "",
  branchCode: "",
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

  const updateField = <K extends keyof PayoutFormState>(
    field: K,
    value: PayoutFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const updateCountry = (country: PayoutCountry) => {
    const config = getPayoutCountryConfig(country);
    setForm((current) => ({ ...current, country, bankName: config.banks[0] }));
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
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: "",
      swiftCode: account.swiftCode ?? "",
      routingNumber: "",
      sortCode: "",
      branchCode: "",
      isDefault: account.isDefault,
    });
    setError(null);
    setSuccess(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setForm((current) => ({ ...current, accountNumber: "" }));
    setFormVisible(false);
    setEditingId(null);
  };

  const submit = async () => {
    if (submitting) return;
    const accountNumber = form.accountNumber.replace(/\s/g, "");
    if (!form.accountHolderName.trim() || !form.bankName) {
      setError("Account holder and bank are required.");
      return;
    }
    if ((!editingId || accountNumber) && !/^\d{6,24}$/.test(accountNumber)) {
      setError("Account number must contain 6 to 24 digits.");
      return;
    }
    if (form.swiftCode && !/^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/.test(form.swiftCode)) {
      setError("SWIFT code must contain 8 or 11 letters and numbers.");
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
        await paymentMockService.saveBankAccount(userId, {
          id: editingId,
          country: form.country,
          currency: countryConfig.currency,
          bankName: form.bankName,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          swiftCode: form.swiftCode.trim() || undefined,
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
          country: form.country,
          currency: countryConfig.currency,
          accountHolderName: form.accountHolderName.trim(),
          accountNumber,
          bankName: form.bankName,
          ...(form.swiftCode.trim() ? { swiftCode: form.swiftCode.trim().toUpperCase() } : {}),
          ...(form.routingNumber.trim() ? { routingNumber: form.routingNumber.trim() } : {}),
          ...(form.sortCode.trim() ? { sortCode: form.sortCode.trim() } : {}),
          ...(form.branchCode.trim() ? { branchCode: form.branchCode.trim() } : {}),
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
          swiftCode: form.swiftCode.trim() || undefined,
          isDefault: form.isDefault || accounts.length === 0,
        });
        await load();
      }
      setSuccess("Payout account created by the payment API.");
      setFormVisible(false);
    } finally {
      setForm((current) => ({
        ...current,
        accountNumber: "",
        routingNumber: "",
        sortCode: "",
        branchCode: "",
      }));
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
    bankOptions: countryConfig.banks,
    updateField,
    updateCountry,
    openCreate,
    openEdit,
    setDefault,
    deleteAccount,
    closeForm,
    submit,
    back: () => router.back(),
  };
};
