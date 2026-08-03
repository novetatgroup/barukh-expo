import { AuthContext } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { getPaymentExecutionMode } from "@/services/paymentConfig";
import { paymentMockService } from "@/services/paymentMockService";
import { paymentService } from "@/services/paymentService";
import { PaymentStatus } from "@/types/payment";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";

const statusMessages: Record<PaymentStatus, string> = {
  CAPTURED: "The payment was confirmed as captured.",
  PENDING: "The payment remains pending. Redirect values were not used as proof of success.",
  FAILED: "The payment service confirmed that the payment failed.",
  CANCELLED: "The payment service confirmed that the payment was cancelled.",
  REFUNDED: "The payment service confirmed that the payment was refunded.",
};

const mockStatusMessages: Record<PaymentStatus, string> = {
  CAPTURED: "The development scenario reconciled as captured. No real charge was made.",
  PENDING: "The simulated payment remains pending. Redirect values were not used as proof of success.",
  FAILED: "The development scenario reconciled as failed.",
  CANCELLED: "The development scenario reconciled as cancelled.",
  REFUNDED: "The development fixture reconciled as refunded.",
};

export const usePaymentReturn = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const {
    reference,
    shipmentId,
    paymentStatus,
    isRestoring,
    updateSafePayment,
  } = usePayment();
  const mode = getPaymentExecutionMode();
  const [message, setMessage] = useState("Checking the saved payment reference...");
  const [loading, setLoading] = useState(true);
  const ranRef = useRef(false);

  useEffect(() => {
    if (isRestoring || ranRef.current) return;
    ranRef.current = true;

    const reconcile = async () => {
      if (!reference || !shipmentId || !userId) {
        setMessage("No saved payment is available to reconcile.");
        setLoading(false);
        return;
      }

      await updateSafePayment({ uiPhase: "recovering" });
      const result =
        mode === "mock"
          ? await paymentMockService.reconcile(userId, reference)
          : accessToken
            ? (await paymentService.getPaymentStatus(reference, accessToken)).data
            : null;

      if (!result) {
        setMessage(
          mode === "mock"
            ? "The simulated payment could not be recovered."
            : "Authoritative payment status recovery is not available yet.",
        );
        setLoading(false);
        return;
      }

      await updateSafePayment({
        reference: result.reference,
        paymentStatus: result.paymentStatus,
        uiPhase: result.paymentStatus === "PENDING" ? "recovering" : "complete",
      });
      setMessage(
        mode === "mock"
          ? mockStatusMessages[result.paymentStatus]
          : statusMessages[result.paymentStatus],
      );
      setLoading(false);
    };

    void reconcile();
  }, [accessToken, isRestoring, mode, reference, shipmentId, updateSafePayment, userId]);

  const continueToPayment = () => {
    if (!shipmentId) {
      router.replace("/(tabs)/profile");
      return;
    }
    router.replace({
      pathname: "/(sender)/modeOfPayment",
      params: { shipmentId, accepted: "true" },
    });
  };

  return { mode, loading, message, paymentStatus, continueToPayment };
};
