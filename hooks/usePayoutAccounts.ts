import { getPayoutCountryConfig } from "@/constants/payout";
import { AuthContext } from "@/context/AuthContext";
import { bankService, SupportedBank } from "@/services/bankService";
import { paymentService } from "@/services/paymentService";
import { MaskedBankAccount, PayoutCountry, PayoutRecord } from "@/types/payment";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "toastify-react-native";

const PAYOUTS_PAGE_LIMIT = 15;

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

  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsHasNextPage, setPayoutsHasNextPage] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutsRefreshing, setPayoutsRefreshing] = useState(false);
  const [payoutsLoadingMore, setPayoutsLoadingMore] = useState(false);

  const bankCacheRef = useRef<Record<string, SupportedBank[]>>({});
  const bankRequestVersionRef = useRef(0);
  const countryConfig = useMemo(() => getPayoutCountryConfig(form.country), [form.country]);

  const load = useCallback(async () => {
    if (!userId || !accessToken) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const result = await paymentService.listBankAccounts(accessToken);
    if (result.ok && result.data) {
      const list = Array.isArray(result.data) ? result.data : result.data.data;
      setAccounts((list || []).map((account) => ({ ...account, id: account.id ?? account.bankAccountId ?? "" })));
    } else {
      setError(result.error || "Unable to load payout accounts.");
      setAccounts([]);
    }
    setLoading(false);
  }, [accessToken, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const fetchPayouts = useCallback(
    async (pageToLoad = 1, shouldRefresh = false) => {
      if (!accessToken) {
        setPayoutsLoading(false);
        setPayoutsRefreshing(false);
        setPayoutsLoadingMore(false);
        return;
      }

      if (pageToLoad === 1 && !shouldRefresh) setPayoutsLoading(true);
      if (shouldRefresh) setPayoutsRefreshing(true);
      if (pageToLoad > 1) setPayoutsLoadingMore(true);

      const { data, ok, error: fetchError } = await paymentService.getPayouts(
        { page: pageToLoad, limit: PAYOUTS_PAGE_LIMIT },
        accessToken,
      );

      if (ok && data) {
        setPayouts((current) => (pageToLoad === 1 ? data.data : [...current, ...data.data]));
        setPayoutsPage(data.meta.page);
        setPayoutsHasNextPage(data.meta.hasNextPage);
      } else if (fetchError) {
        Toast.error(fetchError);
      }

      setPayoutsLoading(false);
      setPayoutsRefreshing(false);
      setPayoutsLoadingMore(false);
    },
    [accessToken],
  );

  useFocusEffect(
    useCallback(() => {
      void fetchPayouts(1, false);
    }, [fetchPayouts]),
  );

  const reloadPayouts = () => fetchPayouts(1, true);

  const loadMorePayouts = () => {
    if (!payoutsHasNextPage || payoutsLoadingMore || payoutsLoading || payoutsRefreshing) return;
    fetchPayouts(payoutsPage + 1);
  };

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
    setEditingId(account.id);
    setForm({
      country: account.country,
      bankId: `existing:${account.bankName}`,
      bankCode: account.bankCode ?? "",
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
    if (!form.accountHolderName.trim() || !form.bankId || !form.bankName || !form.bankCode) {
      setError("Account holder and a supported bank are required.");
      return;
    }
    if ((!editingId || accountNumber) && !/^\d{6,24}$/.test(accountNumber)) {
      setError("Account number must contain 6 to 24 digits.");
      return;
    }
    if (!userId || !accessToken) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        const updateResult = await paymentService.updateBankAccount(
          editingId,
          {
            country: form.country,
            currency: countryConfig.currency,
            bankName: form.bankName,
            bankCode: form.bankCode,
            accountHolderName: form.accountHolderName.trim(),
            ...(accountNumber ? { accountNumber } : {}),
            isDefault: form.isDefault,
          },
          accessToken,
        );
        if (!updateResult.ok) {
          setError(updateResult.error || "Unable to update the payout account.");
          return;
        }
        setSuccess("Payout account updated.");
        await load();
        setFormVisible(false);
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
          bankCode: form.bankCode,
          isDefault: form.isDefault,
        },
        accessToken,
      );

      if (!result.ok) {
        setError(result.error || "Unable to create the payout account.");
        return;
      }
      setSuccess("Payout account created.");
      await load();
      setFormVisible(false);
    } finally {
      setForm((current) => ({ ...current, accountNumber: "" }));
      setSubmitting(false);
    }
  };

  const setDefault = async (accountId: string) => {
    if (!userId || !accessToken) return;
    setError(null);
    const result = await paymentService.setDefaultBankAccount(accountId, accessToken);
    if (!result.ok) {
      setError(result.error || "Unable to set default account.");
      return;
    }
    setSuccess("Default account updated.");
    await load();
  };

  const deleteAccount = async (accountId: string) => {
    if (!userId || !accessToken) return;
    setError(null);
    const result = await paymentService.deleteBankAccount(accountId, accessToken);
    if (!result.ok) {
      setError(result.error || "Unable to delete account.");
      return;
    }
    setSuccess("Account removed.");
    await load();
  };

  return {
    accounts,
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
    payouts,
    payoutsLoading,
    payoutsRefreshing,
    payoutsLoadingMore,
    reloadPayouts,
    loadMorePayouts,
    back: () => router.back(),
  };
};
