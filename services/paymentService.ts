import { API_ENDPOINTS, apiRequest } from "@/services/api";
import {
  MaskedBankAccount,
  PaymentAdditionalField,
  PaymentChallenge,
  PaymentNextAction,
  PaymentResponse,
  PaymentStatus,
  PaymentTransaction,
  PayoutCountry,
  PayoutCurrency,
  PayoutRecord,
  UserCard,
} from "@/types/payment";

export type CreateBankAccountInput = {
  userId: string;
  country: PayoutCountry;
  currency: PayoutCurrency;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
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

export type CreatePaymentCardInput = {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
};

export type CreatePaymentCardResponse = {
  id?: string;
  flwPaymentCardId?: string;
  last4?: string;
  flwPaymentCardLast4?: string;
  cardHolderName?: string;
  message?: string;
};

export type UpdateBankAccountInput = Partial<
  Omit<CreateBankAccountInput, "userId">
>;

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

export type GetTransactionsParams = {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  fromDate?: string;
};

export interface TransactionsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetTransactionsResponse {
  data: PaymentTransaction[];
  meta: TransactionsMeta;
}

export type GetPayoutsParams = {
  page?: number;
  limit?: number;
};

export interface GetPayoutsResponse {
  data: PayoutRecord[];
  meta: TransactionsMeta;
}

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

  async listBankAccounts(accessToken: string) {
    return apiRequest<{ data: MaskedBankAccount[] } | MaskedBankAccount[]>(
      API_ENDPOINTS.users.listBankAccounts,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  },

  async updateBankAccount(id: string, input: UpdateBankAccountInput, accessToken: string) {
    return apiRequest<MaskedBankAccount>(API_ENDPOINTS.users.updateBankAccount(id), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    });
  },

  async deleteBankAccount(id: string, accessToken: string) {
    return apiRequest<{ message?: string }>(API_ENDPOINTS.users.deleteBankAccount(id), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async setDefaultBankAccount(id: string, accessToken: string) {
    return apiRequest<MaskedBankAccount>(API_ENDPOINTS.users.setDefaultBankAccount(id), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async createPaymentCard(input: CreatePaymentCardInput, accessToken: string) {
    return apiRequest<CreatePaymentCardResponse>(API_ENDPOINTS.users.createPaymentCard, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    });
  },

  async getPaymentCards(accessToken: string) {
    return apiRequest<{ cards: UserCard[] } | UserCard[]>(API_ENDPOINTS.users.getPaymentCards, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
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

  async getTransactions(params: GetTransactionsParams, accessToken: string) {
    return apiRequest<GetTransactionsResponse>(API_ENDPOINTS.payments.getTransactions(params), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async getPayouts(params: GetPayoutsParams, accessToken: string) {
    return apiRequest<GetPayoutsResponse>(API_ENDPOINTS.payments.getPayouts(params), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // TODO(izaiah): backend has no dedicated status endpoint yet (see payments-integration-guide §7).
  // Fall back to re-calling next-action with an empty PIN payload so the backend re-reads
  // Flutterwave's current status without mutating card state. Swap for a real
  // GET /payments/status/:reference once available.
  async getPaymentStatus(reference: string, accessToken: string) {
    const result = await apiRequest<unknown>(API_ENDPOINTS.payments.nextAction, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { reference, data: { type: "STATUS_CHECK" } },
    });
    const parsed = result.ok ? parsePaymentResponse(result.data) : null;
    return {
      ...result,
      data: parsed,
      error: result.ok && !parsed ? "The payment service returned an unsupported response." : result.error,
      ok: result.ok && Boolean(parsed),
    };
  },
};
