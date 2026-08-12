export type PaymentStatus =
  | "PENDING"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentUiPhase =
  | "idle"
  | "loading"
  | "reviewing"
  | "submitting"
  | "authorising"
  | "redirecting"
  | "recovering"
  | "complete"
  | "error";

export type PaymentExecutionMode = "api" | "blocked";

export type PaymentAdditionalField =
  | "billingZip"
  | "billingCity"
  | "billingAddress"
  | "billingState"
  | "billingCountry";

export type PaymentNextAction =
  | { mode: "PIN"; url: null; requiresAdditionalFields: [] }
  | { mode: "OTP"; url: null; requiresAdditionalFields: [] }
  | {
      mode: "ADDITIONAL_FIELDS";
      url: null;
      requiresAdditionalFields: PaymentAdditionalField[];
    }
  | { mode: "REDIRECT_URL"; url: string; requiresAdditionalFields: [] };

export type PaymentChallenge =
  | { type: "PIN"; pin: string }
  | { type: "OTP"; otp: string }
  | {
      type: "ADDITIONAL_FIELDS";
      additionalFields: Partial<Record<PaymentAdditionalField, string>>;
    };

export type MaskedSavedCard = {
  id: string;
  brand: "VISA" | "MASTERCARD" | "AMEX" | "OTHER";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
};

export type PaymentHistoryItem = {
  reference: string;
  shipmentId: string;
  amountMinor: number;
  currency: "USD";
  status: PaymentStatus;
  createdAt: string;
  maskedMethod: MaskedSavedCard;
  description: string;
};

export type PayoutCountry = "Uganda" | "Kenya" | "Tanzania" | "Rwanda";
export type PayoutCurrency = "UGX" | "KES" | "TZS" | "RWF" | "USD";

export type MaskedBankAccount = {
  id: string;
  country: PayoutCountry;
  currency: PayoutCurrency;
  bankName: string;
  accountHolderName: string;
  maskedAccountNumber: string;
  swiftCode?: string;
  isDefault: boolean;
};

export type PayoutStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "REJECTED";

export type PayoutState =
  | { status: "NOT_STARTED"; shipmentId: string }
  | { status: "PENDING" | "PROCESSING"; shipmentId: string; updatedAt: string }
  | { status: "PAID"; shipmentId: string; updatedAt: string; maskedAccount: string }
  | {
      status: "REJECTED";
      shipmentId: string;
      updatedAt: string;
      guidance: string;
    };

export type SafePaymentRecovery = {
  userId: string;
  shipmentId: string;
  reference: string;
  paymentStatus: PaymentStatus;
  uiPhase: PaymentUiPhase;
  maskedMethod: MaskedSavedCard | null;
  updatedAt: string;
};

export type PaymentResponse = {
  status: "success";
  message: string;
  reference: string;
  paymentStatus: PaymentStatus;
  nextAction?: PaymentNextAction;
  data?: {
    amount: number;
    currency: string;
    meta: Record<string, string>;
  };
};
