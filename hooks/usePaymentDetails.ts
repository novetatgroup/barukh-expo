import { AuthContext } from "@/context/AuthContext";
import { getPaymentExecutionMode } from "@/services/paymentConfig";
import { paymentMockService } from "@/services/paymentMockService";
import { PaymentHistoryItem } from "@/types/payment";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";

export const usePaymentDetails = (reference?: string) => {
  const router = useRouter();
  const { userId } = useContext(AuthContext);
  const [item, setItem] = useState<PaymentHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId || !reference || getPaymentExecutionMode() !== "mock") {
        setLoading(false);
        return;
      }
      const history = await paymentMockService.getHistory(userId);
      setItem(history.find((entry) => entry.reference === reference) ?? null);
      setLoading(false);
    };
    void load();
  }, [reference, userId]);

  return { item, loading, back: () => router.back() };
};
