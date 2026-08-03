import { AuthContext } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { useRole } from "@/context/RoleContext";
import {
  getPaymentExecutionMode,
  isAllowedPaymentRedirect,
  isChargeExecutionReady,
} from "@/services/paymentConfig";
import { MOCK_CARDS, paymentMockService } from "@/services/paymentMockService";
import { paymentService } from "@/services/paymentService";
import { senderService, ShipmentDetails } from "@/services/senderService";
import { UserProfile, userService } from "@/services/userService";
import {
  PaymentChallenge,
  PaymentMockScenario,
  PaymentNextAction,
  PaymentResponse,
  PaymentStatus,
} from "@/types/payment";
import * as Linking from "expo-linking";
import { Href, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

const ACCEPTED_SHIPMENT_STATUSES = new Set([
  "ACCEPTED",
  "PICKED_UP",
  "INTRANSIT",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
]);

type UsePaymentCheckoutInput = {
  shipmentId: string;
  acceptedParam?: string;
};

export const usePaymentCheckout = ({
  shipmentId,
  acceptedParam,
}: UsePaymentCheckoutInput) => {
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
    clearPayment,
  } = payment;
  const mode = getPaymentExecutionMode();
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState<PaymentNextAction | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [selectedCardId, setSelectedCardId] = useState(MOCK_CARDS[0].id);
  const [scenario, setScenarioState] =
    useState<PaymentMockScenario>("direct_capture");
  const [mockKycVerified, setMockKycVerified] = useState(true);
  const [mockAccepted, setMockAccepted] = useState(acceptedParam === "true");
  const inFlightRef = useRef(false);
  const reconciledReferenceRef = useRef<string | null>(null);

  const cards = mode === "mock" ? MOCK_CARDS : [];
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

    if (!userId) {
      setLoadError("Your session is unavailable. Please log in again.");
      setLoading(false);
      return;
    }

    if (mode === "mock") {
      const mockShipment = await paymentMockService.getShipment(
        userId,
        shipmentId,
        acceptedParam === undefined ? undefined : acceptedParam === "true",
      );
      setShipment(mockShipment);
      setMockAccepted(ACCEPTED_SHIPMENT_STATUSES.has(mockShipment.status.toUpperCase()));
      setLoading(false);
      return;
    }

    if (!accessToken) {
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
  }, [acceptedParam, accessToken, mode, shipmentId, userId]);

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
    if (!paymentReference || !userId || inFlightRef.current) return;
    inFlightRef.current = true;
    setActionError(null);
    await updateSafePayment({ uiPhase: "recovering" });

    try {
      if (mode === "mock") {
        const response = await paymentMockService.reconcile(userId, paymentReference);
        if (!response) {
          setActionError("The simulated payment could not be recovered.");
          return;
        }
        await applyResponse(response);
        return;
      }

      if (!accessToken) {
        setActionError("Your session is unavailable. Please log in again.");
        return;
      }

      const result = await paymentService.getPaymentStatus(paymentReference, accessToken);
      if (!result.ok || !result.data) {
        setActionError(result.error);
        return;
      }
      await applyResponse(result.data);
    } finally {
      inFlightRef.current = false;
    }
  }, [accessToken, applyResponse, mode, paymentReference, updateSafePayment, userId]);

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

  const isKycVerified = mode === "mock" ? mockKycVerified : Boolean(profile?.isKycVerified);
  const isAccepted =
    mode === "mock"
      ? mockAccepted
      : Boolean(shipment && ACCEPTED_SHIPMENT_STATUSES.has(shipment.status.toUpperCase()));
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
    if (!isAccepted) return "Payment unlocks after the traveller accepts the shipment.";
    if (!isUsd) return "This checkout supports authoritative USD shipments only.";
    if (hasOtherPendingPayment) {
      return "Resume the pending payment before starting another one.";
    }
    if (mode === "blocked") {
      return "Payments are blocked in this build. No simulated success is available.";
    }
    if (mode === "api" && !isChargeExecutionReady) {
      return "Live charge execution is waiting for the remaining backend readiness contracts.";
    }
    if (!selectedCard) {
      return "Saved-card listing is unavailable. Secure card setup is still pending approval.";
    }
    return null;
  }, [
    hasOtherPendingPayment,
    isAccepted,
    isKycVerified,
    isUsd,
    mode,
    role,
    selectedCard,
  ]);

  const pay = useCallback(async () => {
    if (inFlightRef.current || blockedReason || !shipment || !selectedCard || !userId) return;
    inFlightRef.current = true;
    setActionError(null);
    await updateSafePayment({ uiPhase: "submitting", maskedMethod: selectedCard });

    try {
      if (mode !== "mock") {
        setActionError("Live charge execution is not enabled in this build.");
        await updateSafePayment({ uiPhase: "error" });
        return;
      }

      const result = await paymentMockService.initiate(
        userId,
        shipment,
        selectedCard,
        scenario,
      );
      if (!result.ok) {
        setActionError(result.error);
        await updateSafePayment({ uiPhase: "error" });
        return;
      }
      await applyResponse(result.data);
    } finally {
      inFlightRef.current = false;
    }
  }, [
    applyResponse,
    blockedReason,
    mode,
    scenario,
    selectedCard,
    shipment,
    updateSafePayment,
    userId,
  ]);

  const submitChallenge = useCallback(
    async (challenge: PaymentChallenge) => {
      if (
        inFlightRef.current ||
        mode !== "mock" ||
        !shipment ||
        !selectedCard ||
        !userId ||
        !paymentReference
      ) {
        return;
      }

      inFlightRef.current = true;
      setActionError(null);
      await updateSafePayment({ uiPhase: "submitting" });
      try {
        const response = await paymentMockService.submitChallenge(
          userId,
          shipment,
          selectedCard,
          challenge,
          paymentReference,
        );
        await applyResponse(response);
      } finally {
        inFlightRef.current = false;
      }
    },
    [applyResponse, mode, paymentReference, selectedCard, shipment, updateSafePayment, userId],
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

  const simulateReturn = useCallback(() => {
    if (mode !== "mock" || !paymentReference) return;
    router.push({
      pathname: "/(sender)/paymentReturn",
      params: { source: "mock" },
    } as unknown as Href);
  }, [mode, paymentReference, router]);

  const setScenario = useCallback(
    async (nextScenario: PaymentMockScenario) => {
      setScenarioState(nextScenario);
      setStatus(null);
      setNextAction(null);
      setActionError(null);
      reconciledReferenceRef.current = null;
      if (userId && shipment) {
        await paymentMockService.resetShipmentPayment(userId, shipment.id);
        await clearPayment();
        beginPayment({ shipmentId: shipment.id, maskedMethod: selectedCard });
      }
    },
    [beginPayment, clearPayment, selectedCard, shipment, userId],
  );

  const retryMock = useCallback(() => {
    void setScenario(scenario);
  }, [scenario, setScenario]);

  return {
    mode,
    shipment,
    cards,
    selectedCardId,
    setSelectedCardId,
    scenario,
    setScenario,
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
    mockKycVerified,
    setMockKycVerified,
    mockAccepted,
    setMockAccepted,
    pay,
    submitChallenge,
    openRedirect,
    simulateReturn,
    retryMock,
    reload: load,
    openVerification: () => router.push("/(KYC)/KYCLanding"),
    back: () => router.back(),
  };
};
