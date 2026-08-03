import { AuthContext } from "@/context/AuthContext";
import {
  clearPaymentRecovery,
  clearUserPaymentData,
  getPaymentRecovery,
  savePaymentRecovery,
} from "@/services/paymentStorage";
import {
  MaskedSavedCard,
  PaymentStatus,
  PaymentUiPhase,
  SafePaymentRecovery,
} from "@/types/payment";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type PaymentContextState = {
  shipmentId: string | null;
  reference: string | null;
  paymentStatus: PaymentStatus | null;
  uiPhase: PaymentUiPhase;
  maskedMethod: MaskedSavedCard | null;
};

type PaymentContextType = PaymentContextState & {
  isRestoring: boolean;
  beginPayment: (input: {
    shipmentId: string;
    maskedMethod: MaskedSavedCard | null;
  }) => void;
  updateSafePayment: (input: {
    reference?: string | null;
    paymentStatus?: PaymentStatus | null;
    uiPhase?: PaymentUiPhase;
    maskedMethod?: MaskedSavedCard | null;
  }) => Promise<void>;
  clearPayment: () => Promise<void>;
};

const initialState: PaymentContextState = {
  shipmentId: null,
  reference: null,
  paymentStatus: null,
  uiPhase: "idle",
  maskedMethod: null,
};

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useContext(AuthContext);
  const [state, setState] = useState<PaymentContextState>(initialState);
  const [isRestoring, setIsRestoring] = useState(true);
  const stateRef = useRef(state);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      setIsRestoring(true);
      const previousUserId = previousUserIdRef.current;

      if (previousUserId && previousUserId !== userId) {
        await clearUserPaymentData(previousUserId);
      }

      previousUserIdRef.current = userId;

      if (!userId) {
        if (active) {
          setState(initialState);
          setIsRestoring(false);
        }
        return;
      }

      const recovery = await getPaymentRecovery(userId);
      if (active) {
        setState(
          recovery
            ? {
                shipmentId: recovery.shipmentId,
                reference: recovery.reference,
                paymentStatus: recovery.paymentStatus,
                uiPhase: "recovering",
                maskedMethod: recovery.maskedMethod,
              }
            : initialState,
        );
        setIsRestoring(false);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, [userId]);

  const beginPayment = useCallback(
    ({
      shipmentId,
      maskedMethod,
    }: {
      shipmentId: string;
      maskedMethod: MaskedSavedCard | null;
    }) => {
      setState({
        shipmentId,
        reference: null,
        paymentStatus: null,
        uiPhase: "reviewing",
        maskedMethod,
      });
    },
    [],
  );

  const updateSafePayment = useCallback(
    async (input: {
      reference?: string | null;
      paymentStatus?: PaymentStatus | null;
      uiPhase?: PaymentUiPhase;
      maskedMethod?: MaskedSavedCard | null;
    }) => {
      const next: PaymentContextState = {
        ...stateRef.current,
        ...input,
      };
      stateRef.current = next;
      setState(next);

      if (!userId) return;

      if (next.reference && next.shipmentId && next.paymentStatus === "PENDING") {
        const recovery: SafePaymentRecovery = {
          userId,
          shipmentId: next.shipmentId,
          reference: next.reference,
          paymentStatus: "PENDING",
          uiPhase: next.uiPhase,
          maskedMethod: next.maskedMethod,
          updatedAt: new Date().toISOString(),
        };
        await savePaymentRecovery(recovery);
      } else if (next.paymentStatus && next.paymentStatus !== "PENDING") {
        await clearPaymentRecovery(userId);
      }
    },
    [userId],
  );

  const clearPayment = useCallback(async () => {
    stateRef.current = initialState;
    setState(initialState);
    if (userId) await clearPaymentRecovery(userId);
  }, [userId]);

  return (
    <PaymentContext.Provider
      value={{
        ...state,
        isRestoring,
        beginPayment,
        updateSafePayment,
        clearPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
