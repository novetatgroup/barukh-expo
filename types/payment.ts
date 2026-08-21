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

export type UserCard = {
  cardHolderName: string;
  last4: string;
  flwPaymentCardId: string;
  isDefault: boolean;
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

export type PaymentTransaction = {
  id: string;
  reference: string;
  shipmentId: string;
  travellerId: string;
  travellerName: string;
  sourceDestination: string;
  status: PaymentStatus;
  totalAmount: number;
  travellerAmount: number;
  currency: string;
  createdAt: string;
  capturedAt: string | null;
};

export type PayoutCountry = "Uganda" | "Kenya" | "Tanzania" | "Rwanda";
export type PayoutCurrency = "UGX" | "KES" | "TZS" | "RWF" | "USD";

export type MaskedBankAccount = {
  id: string;
  bankAccountId?: string;
  country: PayoutCountry;
  currency: PayoutCurrency;
  bankName: string;
  bankCode?: string | null;
  accountHolderName: string;
  maskedAccountNumber: string;
  swiftCode?: string;
  isDefault: boolean;
};

export type PayoutRecordStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type PayoutRecord = {
  id: string;
  shipmentId: string;
  status: PayoutRecordStatus;
  amount: number;
  currency: string;
  createdAt: string;
  completedAt?: string;
  failureMessage?: string;
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
