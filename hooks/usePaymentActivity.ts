import { PaymentHistoryItem } from "@/types/payment";
import { Href, useRouter } from "expo-router";

export const usePaymentActivity = () => {
  const router = useRouter();

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
    history: [] as PaymentHistoryItem[],
    loading: false,
    reload: () => {},
    openDetails,
    resume,
    back: () => router.back(),
  };
};
