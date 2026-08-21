import { AuthContext } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
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
  const [message, setMessage] = useState("Checking the saved payment reference...");
  const [loading, setLoading] = useState(true);
  const ranRef = useRef(false);

  useEffect(() => {
    if (isRestoring || ranRef.current) return;
    ranRef.current = true;

    const POLL_INTERVAL_MS = 3000;
    const MAX_ATTEMPTS = 20;

    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    const reconcile = async () => {
      if (!reference || !shipmentId || !userId || !accessToken) {
        setMessage("No saved payment is available to reconcile.");
        setLoading(false);
        return;
      }

      await updateSafePayment({ uiPhase: "recovering" });

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const result = (await paymentService.getPaymentStatus(reference, accessToken)).data;

        if (!result) {
          setMessage("Authoritative payment status recovery is not available yet.");
          setLoading(false);
          return;
        }

        if (result.paymentStatus !== "PENDING") {
          await updateSafePayment({
            reference: result.reference,
            paymentStatus: result.paymentStatus,
            uiPhase: "complete",
          });
          setMessage(statusMessages[result.paymentStatus]);
          setLoading(false);
          return;
        }

        await updateSafePayment({
          reference: result.reference,
          paymentStatus: result.paymentStatus,
          uiPhase: "recovering",
        });

        if (attempt < MAX_ATTEMPTS - 1) {
          await wait(POLL_INTERVAL_MS);
        }
      }

      setMessage(
        "The payment is still processing. We'll notify you as soon as it's confirmed — safe to close this screen.",
      );
      setLoading(false);
    };

    void reconcile();
  }, [accessToken, isRestoring, reference, shipmentId, updateSafePayment, userId]);

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

  return { loading, message, paymentStatus, continueToPayment };
};
