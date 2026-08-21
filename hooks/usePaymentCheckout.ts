import { AuthContext } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { useRole } from "@/context/RoleContext";
import {
  getPaymentExecutionMode,
  isAllowedPaymentRedirect,
  isChargeExecutionReady,
} from "@/services/paymentConfig";
import { paymentService } from "@/services/paymentService";
import { senderService, ShipmentDetails } from "@/services/senderService";
import { UserProfile, userService } from "@/services/userService";
import {
  MaskedSavedCard,
  PaymentChallenge,
  PaymentNextAction,
  PaymentResponse,
  PaymentStatus,
} from "@/types/payment";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

const ACCEPTED_SHIPMENT_STATUSES = new Set([
  "ACCEPTED",
  "TRAVELLER_CONFIRMED",
  "PICKED_UP",
  "INTRANSIT",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
]);

type UsePaymentCheckoutInput = {
  shipmentId: string;
};

export const usePaymentCheckout = ({ shipmentId }: UsePaymentCheckoutInput) => {
  const router = useRouter();
  const { accessToken, userId } = useContext(AuthContext);
  const { role } = useRole();
  const payment = usePayment();
  const {
    shipmentId: paymentShipmentId,
    reference: paymentReference,
    paymentStatus,
    uiPhase,
    isRestoring,
    beginPayment,
    updateSafePayment,
  } = payment;
  const mode = getPaymentExecutionMode();
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState<PaymentNextAction | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const inFlightRef = useRef(false);
  const reconciledReferenceRef = useRef<string | null>(null);

  const cards = useMemo<MaskedSavedCard[]>(() => {
    const flw = profile?.flwCustomerObject;
    if (!flw?.flwPaymentCardId || !flw.flwPaymentCardLast4) return [];
    return [
      {
        id: flw.flwPaymentCardId,
        brand: "OTHER",
        last4: flw.flwPaymentCardLast4,
        expiryMonth: "",
        expiryYear: "",
        cardholderName: flw.flwPaymentCardHolderName ?? "",
        isDefault: flw.flwPaymentCardIsDefault ?? true,
      },
    ];
  }, [profile]);

  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ?? cards[0] ?? null;
  const returnUri = Linking.createURL("/(sender)/paymentReturn");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    if (!shipmentId) {
      setLoadError("A shipment ID is required to open checkout.");
      setLoading(false);
      return;
    }

    if (!userId || !accessToken) {
      setLoadError("Your session is unavailable. Please log in again.");
      setLoading(false);
      return;
    }

    const [shipmentResult, profileResult] = await Promise.all([
      senderService.getShipment(shipmentId, accessToken),
      userService.getUser(userId, accessToken),
    ]);

    if (!shipmentResult.ok || !shipmentResult.data) {
      setLoadError(shipmentResult.error || "Unable to load this shipment.");
      setLoading(false);
      return;
    }

    if (!profileResult.ok || !profileResult.data) {
      setLoadError(profileResult.error || "Unable to confirm payment eligibility.");
      setLoading(false);
      return;
    }

    setShipment(shipmentResult.data);
    setProfile(profileResult.data);
    setLoading(false);
  }, [accessToken, shipmentId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!shipment || !selectedCard) return;
    if (paymentShipmentId === shipment.id) {
      setStatus(paymentStatus);
      return;
    }
    beginPayment({ shipmentId: shipment.id, maskedMethod: selectedCard });
  }, [beginPayment, paymentShipmentId, paymentStatus, selectedCard, shipment]);

  const applyResponse = useCallback(
    async (response: PaymentResponse) => {
      setActionError(null);
      setStatus(response.paymentStatus);
      setNextAction(response.nextAction ?? null);

      await updateSafePayment({
        reference: response.reference,
        paymentStatus: response.paymentStatus,
        uiPhase: response.nextAction
          ? response.nextAction.mode === "REDIRECT_URL"
            ? "redirecting"
            : "authorising"
          : response.paymentStatus === "PENDING"
            ? "recovering"
            : "complete",
        maskedMethod: selectedCard,
      });
    },
    [selectedCard, updateSafePayment],
  );

  const reconcile = useCallback(async () => {
    if (!paymentReference || !accessToken || inFlightRef.current) return;
    inFlightRef.current = true;
    setActionError(null);
    await updateSafePayment({ uiPhase: "recovering" });

    try {
      const result = await paymentService.getPaymentStatus(paymentReference, accessToken);
      if (!result.ok || !result.data) {
        setActionError(result.error);
        return;
      }
      await applyResponse(result.data);
    } finally {
      inFlightRef.current = false;
    }
  }, [accessToken, applyResponse, paymentReference, updateSafePayment]);

  useEffect(() => {
    if (
      !paymentReference ||
      paymentStatus !== "PENDING" ||
      nextAction ||
      paymentShipmentId !== shipmentId ||
      reconciledReferenceRef.current === paymentReference
    ) {
      return;
    }

    reconciledReferenceRef.current = paymentReference;
    void reconcile();
  }, [nextAction, paymentReference, paymentShipmentId, paymentStatus, reconcile, shipmentId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        nextState === "active" &&
        paymentReference &&
        paymentStatus === "PENDING" &&
        !nextAction
      ) {
        void reconcile();
      }
    });
    return () => subscription.remove();
  }, [nextAction, paymentReference, paymentStatus, reconcile]);

  const isKycVerified = Boolean(profile?.isKycVerified);
  const isAccepted = Boolean(
    shipment && ACCEPTED_SHIPMENT_STATUSES.has(shipment.status.toUpperCase()),
  );
  const isUsd = shipment?.currency === "USD";
  const hasOtherPendingPayment = Boolean(
    paymentReference &&
      paymentStatus === "PENDING" &&
      paymentShipmentId &&
      paymentShipmentId !== shipmentId,
  );

  const blockedReason = useMemo(() => {
    if (role !== "SENDER") return "Only the sender can pay for a shipment.";
    if (!isKycVerified) return "Complete identity verification before paying.";
    if (!isAccepted) return "Waiting for traveller confirmation before payment can be made.";
    if (!isUsd) return "This checkout supports authoritative USD shipments only.";
    if (hasOtherPendingPayment) {
      return "Resume the pending payment before starting another one.";
    }
    if (mode === "blocked") {
      return "Payments are temporarily unavailable. Please try again later.";
    }
    if (!isChargeExecutionReady) {
      return "Live charge execution is waiting for the remaining backend readiness contracts.";
    }
    if (!profile?.flwCustomerObject?.flwCustomerId) {
      return "Your payment profile is not ready. Please complete KYC and try again.";
    }
    if (!selectedCard) {
      return "Add a card to continue with the payment.";
    }
    return null;
  }, [
    hasOtherPendingPayment,
    isAccepted,
    isKycVerified,
    isUsd,
    mode,
    profile,
    role,
    selectedCard,
  ]);

  const pay = useCallback(async () => {
    if (inFlightRef.current || blockedReason || !shipment || !selectedCard || !userId) return;
    inFlightRef.current = true;
    setActionError(null);
    await updateSafePayment({ uiPhase: "submitting", maskedMethod: selectedCard });

    try {
      if (!accessToken || !profile?.flwCustomerObject?.flwCustomerId) {
        setActionError("Payment customer profile is not ready.");
        await updateSafePayment({ uiPhase: "error" });
        return;
      }

      const senderName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
      const result = await paymentService.initiateCharge(
        {
          currency: "USD",
          shipmentId: shipment.id,
          customerId: profile.flwCustomerObject.flwCustomerId,
          paymentMethodId: selectedCard.id,
          amount: shipment.priceMinor,
          redirectUrl: returnUri,
          meta: {
            senderId: shipment.senderId,
            travellerId: shipment.travellerId,
            senderName,
            travellerName: shipment.traveller.userId,
            sourceDestination: `${shipment.package.originCity}_${shipment.package.destinationCity}`,
          },
        },
        accessToken,
      );

      if (!result.ok || !result.data) {
        setActionError(result.error || "Failed to initiate payment.");
        await updateSafePayment({ uiPhase: "error" });
        return;
      }
      await applyResponse(result.data);
    } finally {
      inFlightRef.current = false;
    }
  }, [
    accessToken,
    applyResponse,
    blockedReason,
    profile,
    returnUri,
    selectedCard,
    shipment,
    updateSafePayment,
    userId,
  ]);

  const submitChallenge = useCallback(
    async (challenge: PaymentChallenge) => {
      if (
        inFlightRef.current ||
        !shipment ||
        !selectedCard ||
        !userId ||
        !paymentReference ||
        !accessToken
      ) {
        return;
      }

      inFlightRef.current = true;
      setActionError(null);
      await updateSafePayment({ uiPhase: "submitting" });
      try {
        const result = await paymentService.submitNextAction(
          { reference: paymentReference, data: challenge },
          accessToken,
        );
        if (!result.ok || !result.data) {
          setActionError(result.error || "Failed to submit challenge.");
          await updateSafePayment({ uiPhase: "error" });
          return;
        }
        await applyResponse(result.data);
      } finally {
        inFlightRef.current = false;
      }
    },
    [accessToken, applyResponse, paymentReference, selectedCard, shipment, updateSafePayment, userId],
  );

  const openRedirect = useCallback(async () => {
    if (!nextAction || nextAction.mode !== "REDIRECT_URL") return;
    if (!isAllowedPaymentRedirect(nextAction.url)) {
      setActionError("This payment redirect is not on the approved HTTPS host list.");
      return;
    }
    if (!paymentReference) {
      setActionError("The payment reference was not saved. The redirect was cancelled.");
      return;
    }

    await updateSafePayment({ uiPhase: "redirecting" });
    await Linking.openURL(nextAction.url);
  }, [nextAction, paymentReference, updateSafePayment]);

  return {
    mode,
    shipment,
    cards,
    selectedCardId: selectedCard?.id ?? "",
    setSelectedCardId,
    status,
    nextAction,
    uiPhase,
    reference: paymentReference,
    returnUri,
    loading: loading || isRestoring,
    loadError,
    actionError,
    blockedReason,
    isKycVerified,
    isAccepted,
    pay,
    submitChallenge,
    openRedirect,
    reload: load,
    openVerification: () => router.push("/(KYC)/KYCLanding"),
    back: () => router.back(),
  };
};
