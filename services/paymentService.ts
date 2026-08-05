import { API_ENDPOINTS, apiRequest } from "@/services/api";
import {
  PaymentAdditionalField,
  PaymentChallenge,
  PaymentNextAction,
  PaymentResponse,
  PaymentStatus,
  PayoutCountry,
  PayoutCurrency,
} from "@/types/payment";

export type CreateBankAccountInput = {
  userId: string;
  country: PayoutCountry;
  currency: PayoutCurrency;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  routingNumber?: string;
  sortCode?: string;
  branchCode?: string;
  isDefault?: boolean;
};

export type CreateBankAccountResponse = {
  id?: string;
  bankAccountId?: string;
  message?: string;
  isDefault?: boolean;
};

export type InitiateChargeInput = {
  currency: "USD";
  shipmentId: string;
  customerId: string;
  paymentMethodId: string;
  amount: number;
  redirectUrl: string;
  meta: {
    senderId: string;
    travellerId: string;
    senderName: string;
    travellerName: string;
    sourceDestination: string;
  };
};

export type SubmitNextActionInput = {
  reference: string;
  data: PaymentChallenge;
};

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

const additionalFieldAllowlist: PaymentAdditionalField[] = [
  "billingZip",
  "billingCity",
  "billingAddress",
  "billingState",
  "billingCountry",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseNextAction = (value: unknown): PaymentNextAction | undefined => {
  if (!isRecord(value) || typeof value.mode !== "string") return undefined;

  if (value.mode === "PIN" || value.mode === "OTP") {
    return { mode: value.mode, url: null, requiresAdditionalFields: [] };
  }

  if (value.mode === "REDIRECT_URL") {
    if (typeof value.url !== "string" || !value.url) return undefined;
    return { mode: "REDIRECT_URL", url: value.url, requiresAdditionalFields: [] };
  }

  if (value.mode === "ADDITIONAL_FIELDS") {
    const fields = Array.isArray(value.requiresAdditionalFields)
      ? value.requiresAdditionalFields.filter(
          (field): field is PaymentAdditionalField =>
            typeof field === "string" &&
            additionalFieldAllowlist.includes(field as PaymentAdditionalField),
        )
      : [];

    return { mode: "ADDITIONAL_FIELDS", url: null, requiresAdditionalFields: fields };
  }

  return undefined;
};

const parsePaymentResponse = (value: unknown): PaymentResponse | null => {
  if (!isRecord(value)) return null;
  if (value.status !== "success" || typeof value.reference !== "string") return null;
  if (
    typeof value.paymentStatus !== "string" ||
    !paymentStatuses.includes(value.paymentStatus as PaymentStatus)
  ) {
    return null;
  }

  const nextAction = parseNextAction(value.nextAction);
  if (value.nextAction && !nextAction) return null;

  return {
    status: "success",
    message: typeof value.message === "string" ? value.message : "Payment updated",
    reference: value.reference,
    paymentStatus: value.paymentStatus as PaymentStatus,
    ...(nextAction ? { nextAction } : {}),
  };
};

export const paymentService = {
  async createBankAccount(input: CreateBankAccountInput, accessToken: string) {
    return apiRequest<CreateBankAccountResponse>(API_ENDPOINTS.users.createBankAccount, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    });
  },

  async initiateCharge(input: InitiateChargeInput, accessToken: string) {
    const result = await apiRequest<unknown>(API_ENDPOINTS.payments.initiateCharge, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    });
    const parsed = result.ok ? parsePaymentResponse(result.data) : null;

    return {
      ...result,
      data: parsed,
      error: result.ok && !parsed ? "The payment service returned an unsupported response." : result.error,
      ok: result.ok && Boolean(parsed),
    };
  },

  async submitNextAction(input: SubmitNextActionInput, accessToken: string) {
    const result = await apiRequest<unknown>(API_ENDPOINTS.payments.nextAction, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    });
    const parsed = result.ok ? parsePaymentResponse(result.data) : null;

    return {
      ...result,
      data: parsed,
      error: result.ok && !parsed ? "The payment service returned an unsupported response." : result.error,
      ok: result.ok && Boolean(parsed),
    };
  },

  async getPaymentStatus(_reference: string, _accessToken: string) {
    return {
      data: null as PaymentResponse | null,
      error: "Payment status recovery is unavailable until the backend contract is confirmed.",
      ok: false,
    };
  },
};
