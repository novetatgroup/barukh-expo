import { PaymentHistoryItem } from "@/types/payment";
import { useRouter } from "expo-router";

export const usePaymentDetails = (_reference?: string) => {
  const router = useRouter();

  return {
    item: null as PaymentHistoryItem | null,
    loading: false,
    back: () => router.back(),
  };
};
