import { AuthContext } from "@/context/AuthContext";
import { getPaymentExecutionMode } from "@/services/paymentConfig";
import { MOCK_CARDS, paymentMockService } from "@/services/paymentMockService";
import { PaymentHistoryItem } from "@/types/payment";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";

export const usePaymentActivity = () => {
  const router = useRouter();
  const { userId } = useContext(AuthContext);
  const mode = getPaymentExecutionMode();
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId || mode !== "mock") {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setHistory(await paymentMockService.getHistory(userId));
    setLoading(false);
  }, [mode, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openDetails = (item: PaymentHistoryItem) => {
    router.push({
      pathname: "/(profile)/paymentDetails",
      params: { reference: item.reference },
    } as unknown as Href);
  };

  const resume = (item: PaymentHistoryItem) => {
    router.push({
      pathname: "/(sender)/modeOfPayment",
      params: { shipmentId: item.shipmentId, accepted: "true" },
    });
  };

  return {
    mode,
    history,
    cards: mode === "mock" ? MOCK_CARDS : [],
    loading,
    reload: load,
    openDetails,
    resume,
    back: () => router.back(),
  };
};
