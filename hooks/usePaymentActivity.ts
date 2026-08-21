import { AuthContext } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { PaymentTransaction, UserCard } from "@/types/payment";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

const PAGE_LIMIT = 15;

export const usePaymentActivity = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [cards, setCards] = useState<UserCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  const fetchTransactions = useCallback(
    async (pageToLoad = 1, shouldRefresh = false) => {
      if (!accessToken) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        return;
      }

      if (pageToLoad === 1 && !shouldRefresh) setLoading(true);
      if (shouldRefresh) setRefreshing(true);
      if (pageToLoad > 1) setLoadingMore(true);

      const { data, ok, error } = await paymentService.getTransactions(
        { page: pageToLoad, limit: PAGE_LIMIT },
        accessToken
      );

      if (ok && data) {
        setTransactions((current) => (pageToLoad === 1 ? data.data : [...current, ...data.data]));
        setPage(data.meta.page);
        setHasNextPage(data.meta.hasNextPage);
      } else if (error) {
        Toast.error(error);
      }

      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    },
    [accessToken]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const loadCards = useCallback(async () => {
    if (!accessToken) {
      setCards([]);
      setCardsLoading(false);
      return;
    }

    const { data, ok } = await paymentService.getPaymentCards(accessToken);
    const list = ok && data ? (Array.isArray(data) ? data : data.cards) : [];
    setCards(list ?? []);
    setCardsLoading(false);
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadCards();
    }, [loadCards])
  );

  const addCard = () => router.push("/(sender)/addPaymentCard");

  const reload = () => fetchTransactions(1, true);

  const loadMore = () => {
    if (!hasNextPage || loadingMore || loading || refreshing) return;
    fetchTransactions(page + 1);
  };

  const openDetails = (item: PaymentTransaction) => {
    router.push({
      pathname: "/(profile)/paymentDetails",
      params: { reference: item.reference },
    } as unknown as Href);
  };

  const resume = (item: PaymentTransaction) => {
    router.push({
      pathname: "/(sender)/modeOfPayment",
      params: { shipmentId: item.shipmentId, accepted: "true" },
    });
  };

  return {
    transactions,
    loading,
    refreshing,
    loadingMore,
    hasNextPage,
    reload,
    loadMore,
    openDetails,
    resume,
    cards,
    cardsLoading,
    addCard,
    back: () => router.back(),
  };
};
