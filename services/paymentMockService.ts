import { ShipmentDetails } from "@/services/senderService";
import {
  MaskedBankAccount,
  MaskedSavedCard,
  PaymentChallenge,
  PaymentHistoryItem,
  PaymentMockScenario,
  PaymentResponse,
  PayoutState,
} from "@/types/payment";
import {
  getMockPaymentData,
  saveMockPaymentData,
} from "@/services/paymentStorage";

type MockPaymentData = {
  history: PaymentHistoryItem[];
  bankAccounts: MaskedBankAccount[];
  acceptedShipmentIds: string[];
};

export const MOCK_CARDS: MaskedSavedCard[] = [
  {
    id: "mock-card-visa-4242",
    brand: "VISA",
    last4: "4242",
    expiryMonth: "09",
    expiryYear: "29",
    cardholderName: "Barukh Sender",
    isDefault: true,
  },
  {
    id: "mock-card-mastercard-4444",
    brand: "MASTERCARD",
    last4: "4444",
    expiryMonth: "04",
    expiryYear: "30",
    cardholderName: "Barukh Sender",
    isDefault: false,
  },
];

const initialHistory: PaymentHistoryItem[] = [
  {
    reference: "mock-history-captured",
    shipmentId: "mock-shipment-history-1",
    amountMinor: 4860,
    currency: "USD",
    status: "CAPTURED",
    createdAt: "2026-07-29T09:30:00.000Z",
    maskedMethod: MOCK_CARDS[0],
    description: "Documents to Kampala",
  },
  {
    reference: "mock-history-refunded",
    shipmentId: "mock-shipment-history-2",
    amountMinor: 3275,
    currency: "USD",
    status: "REFUNDED",
    createdAt: "2026-07-20T14:15:00.000Z",
    maskedMethod: MOCK_CARDS[1],
    description: "Camera lens to Entebbe",
  },
];

const initialBankAccounts: MaskedBankAccount[] = [
  {
    id: "mock-bank-ug",
    country: "Uganda",
    currency: "UGX",
    bankName: "Stanbic Bank Uganda",
    accountHolderName: "Demo Traveller",
    maskedAccountNumber: "**** 1208",
    swiftCode: "SBICUGKX",
    isDefault: true,
  },
  {
    id: "mock-bank-ke",
    country: "Kenya",
    currency: "KES",
    bankName: "KCB Bank Kenya",
    accountHolderName: "Demo Traveller",
    maskedAccountNumber: "**** 7714",
    swiftCode: "KCBLKENX",
    isDefault: false,
  },
  {
    id: "mock-bank-tz",
    country: "Tanzania",
    currency: "TZS",
    bankName: "CRDB Bank",
    accountHolderName: "Demo Traveller",
    maskedAccountNumber: "**** 5032",
    swiftCode: "CORUTZTZ",
    isDefault: false,
  },
  {
    id: "mock-bank-rw",
    country: "Rwanda",
    currency: "RWF",
    bankName: "Bank of Kigali",
    accountHolderName: "Demo Traveller",
    maskedAccountNumber: "**** 9086",
    swiftCode: "BKIGRWRW",
    isDefault: false,
  },
];

export const MOCK_PAYOUTS: PayoutState[] = [
  {
    status: "PROCESSING",
    shipmentId: "mock-shipment-payout-1",
    updatedAt: "2026-08-02T11:00:00.000Z",
  },
  {
    status: "PAID",
    shipmentId: "mock-shipment-payout-2",
    updatedAt: "2026-07-28T08:45:00.000Z",
    maskedAccount: "**** 1208",
  },
  {
    status: "REJECTED",
    shipmentId: "mock-shipment-payout-3",
    updatedAt: "2026-07-24T16:20:00.000Z",
    guidance:
      "Check your bank details and contact support. Payout retry is handled by the operations team after the account issue is resolved.",
  },
];

const getData = async (userId: string): Promise<MockPaymentData> => {
  const stored = await getMockPaymentData<Partial<MockPaymentData>>(userId);
  return {
    history: stored?.history ?? initialHistory,
    bankAccounts: stored?.bankAccounts ?? initialBankAccounts,
    acceptedShipmentIds: stored?.acceptedShipmentIds ?? [],
  };
};

const saveHistoryItem = async (userId: string, item: PaymentHistoryItem) => {
  const data = await getData(userId);
  const nextHistory = [item, ...data.history.filter((entry) => entry.reference !== item.reference)];
  await saveMockPaymentData(userId, { ...data, history: nextHistory });
};

const responseFor = (
  reference: string,
  paymentStatus: PaymentResponse["paymentStatus"],
  nextAction?: PaymentResponse["nextAction"],
): PaymentResponse => ({
  status: "success",
  message: paymentStatus === "CAPTURED" ? "Payment captured" : "Payment updated",
  reference,
  paymentStatus,
  ...(nextAction ? { nextAction } : {}),
});

const referenceForShipment = (shipmentId: string, scenario?: PaymentMockScenario) =>
  `mock-${scenario ? `${scenario}-` : ""}${shipmentId.replace(/[^a-zA-Z0-9-]/g, "-")}`;

const historyItemFor = (
  shipment: ShipmentDetails,
  status: PaymentHistoryItem["status"],
  card: MaskedSavedCard,
  reference = referenceForShipment(shipment.id),
): PaymentHistoryItem => ({
  reference,
  shipmentId: shipment.id,
  amountMinor: shipment.priceMinor,
  currency: "USD",
  status,
  createdAt: new Date().toISOString(),
  maskedMethod: card,
  description: `${shipment.package.name} to ${shipment.package.destinationCity}`,
});

export const maskAccountNumber = (accountNumber: string) => {
  const digits = accountNumber.replace(/\s/g, "");
  return `**** ${digits.slice(-4)}`;
};

export const paymentMockService = {
  async getShipment(
    userId: string,
    shipmentId: string,
    acceptedOverride?: boolean,
  ): Promise<ShipmentDetails> {
    const storedAcceptance = (await getData(userId)).acceptedShipmentIds.includes(shipmentId);
    const accepted =
      acceptedOverride ?? (shipmentId === "mock-shipment-001" || storedAcceptance);

    return {
      id: shipmentId || "mock-shipment-001",
      senderId: "mock-sender-001",
      travellerId: "mock-traveller-001",
      packageId: "mock-package-001",
      tripId: "mock-trip-001",
      status: accepted ? "ACCEPTED" : "PENDING",
      priceMinor: 4860,
      currency: "USD",
      requestedAt: "2026-08-03T09:00:00.000Z",
      package: {
        id: "mock-package-001",
        name: "MacBook Pro",
        category: "ELECTRONIC",
        weightKg: 2.1,
        originCity: "Toronto",
        destinationCity: "Kampala",
        photoUrl: "",
      },
      travel: {
        id: "mock-trip-001",
        originCity: "Toronto",
        destinationCity: "Kampala",
        departureAt: "2026-08-08T09:00:00.000Z",
        arrivalAt: "2026-08-09T18:00:00.000Z",
        mode: "FLIGHT",
      },
      sender: { id: "mock-sender-001", userId: "mock-sender-user" },
      traveller: { id: "mock-traveller-001", userId: "mock-traveller-user" },
    };
  },

  async markShipmentAccepted(userId: string, shipmentId: string) {
    if (!__DEV__) return;
    const data = await getData(userId);
    if (data.acceptedShipmentIds.includes(shipmentId)) return;
    await saveMockPaymentData(userId, {
      ...data,
      acceptedShipmentIds: [...data.acceptedShipmentIds, shipmentId],
    });
  },

  async clearShipmentAcceptance(userId: string, shipmentId: string) {
    const data = await getData(userId);
    await saveMockPaymentData(userId, {
      ...data,
      acceptedShipmentIds: data.acceptedShipmentIds.filter((id) => id !== shipmentId),
    });
  },

  async getHistory(userId: string) {
    return (await getData(userId)).history;
  },

  async getBankAccounts(userId: string) {
    return (await getData(userId)).bankAccounts;
  },

  async saveBankAccount(
    userId: string,
    account: Omit<MaskedBankAccount, "id" | "maskedAccountNumber"> & {
      accountNumber: string;
      id?: string;
    },
  ) {
    const data = await getData(userId);
    const id = account.id ?? `bank-${Date.now()}`;
    const nextAccount: MaskedBankAccount = {
      id,
      country: account.country,
      currency: account.currency,
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      maskedAccountNumber: account.accountNumber
        ? maskAccountNumber(account.accountNumber)
        : data.bankAccounts.find((item) => item.id === id)?.maskedAccountNumber ?? "**** ----",
      swiftCode: account.swiftCode,
      isDefault: account.isDefault,
    };
    const bankAccounts = [
      nextAccount,
      ...data.bankAccounts
        .filter((item) => item.id !== id)
        .map((item) => ({ ...item, isDefault: nextAccount.isDefault ? false : item.isDefault })),
    ];
    await saveMockPaymentData(userId, { ...data, bankAccounts });
    return nextAccount;
  },

  async setDefaultBankAccount(userId: string, accountId: string) {
    const data = await getData(userId);
    await saveMockPaymentData(userId, {
      ...data,
      bankAccounts: data.bankAccounts.map((account) => ({
        ...account,
        isDefault: account.id === accountId,
      })),
    });
  },

  async deleteBankAccount(userId: string, accountId: string) {
    const data = await getData(userId);
    const removedDefault = data.bankAccounts.some(
      (account) => account.id === accountId && account.isDefault,
    );
    const remaining = data.bankAccounts.filter((account) => account.id !== accountId);
    const bankAccounts = removedDefault
      ? remaining.map((account, index) => ({ ...account, isDefault: index === 0 }))
      : remaining;
    await saveMockPaymentData(userId, { ...data, bankAccounts });
  },

  async resetShipmentPayment(userId: string, shipmentId: string) {
    const data = await getData(userId);
    await saveMockPaymentData(userId, {
      ...data,
      history: data.history.filter((entry) => entry.shipmentId !== shipmentId),
    });
  },

  async initiate(
    userId: string,
    shipment: ShipmentDetails,
    card: MaskedSavedCard,
    scenario: PaymentMockScenario,
  ): Promise<{ ok: true; data: PaymentResponse } | { ok: false; error: string }> {
    if (scenario === "server_failure") {
      return { ok: false, error: "The simulated payment server is unavailable." };
    }

    const existing = (await getData(userId)).history.find(
      (entry) => entry.shipmentId === shipment.id,
    );
    if (existing) {
      return { ok: true, data: responseFor(existing.reference, existing.status) };
    }

    const reference = referenceForShipment(shipment.id, scenario);
    let response: PaymentResponse;

    switch (scenario) {
      case "direct_capture":
        response = responseFor(reference, "CAPTURED");
        break;
      case "pin_to_otp":
        response = responseFor(reference, "PENDING", {
          mode: "PIN",
          url: null,
          requiresAdditionalFields: [],
        });
        break;
      case "additional_fields":
        response = responseFor(reference, "PENDING", {
          mode: "ADDITIONAL_FIELDS",
          url: null,
          requiresAdditionalFields: ["billingZip", "billingCity"],
        });
        break;
      case "three_ds_return":
        response = responseFor(reference, "PENDING", {
          mode: "REDIRECT_URL",
          url: "https://checkout.flutterwave.com/v3/hosted/pay/mock",
          requiresAdditionalFields: [],
        });
        break;
      case "pending":
        response = responseFor(reference, "PENDING");
        break;
      case "decline":
        response = responseFor(reference, "FAILED");
        break;
      case "cancellation":
        response = responseFor(reference, "CANCELLED");
        break;
    }

    await saveHistoryItem(
      userId,
      historyItemFor(shipment, response.paymentStatus, card, reference),
    );
    return { ok: true, data: response };
  },

  async submitChallenge(
    userId: string,
    shipment: ShipmentDetails,
    card: MaskedSavedCard,
    challenge: PaymentChallenge,
    reference: string,
  ): Promise<PaymentResponse> {
    const response =
      challenge.type === "PIN"
        ? responseFor(reference, "PENDING", {
            mode: "OTP",
            url: null,
            requiresAdditionalFields: [],
          })
        : responseFor(reference, "CAPTURED");

    await saveHistoryItem(
      userId,
      historyItemFor(shipment, response.paymentStatus, card, reference),
    );
    return response;
  },

  async reconcile(userId: string, reference: string): Promise<PaymentResponse | null> {
    const data = await getData(userId);
    const entry = data.history.find((item) => item.reference === reference);
    if (!entry) return null;

    const status =
      entry.status === "PENDING" && entry.reference.includes("three_ds_return")
        ? "CAPTURED"
        : entry.status;
    const updated = { ...entry, status } as PaymentHistoryItem;
    await saveHistoryItem(userId, updated);
    if (status === "PENDING" && reference.includes("pin_to_otp")) {
      return responseFor(reference, status, {
        mode: "PIN",
        url: null,
        requiresAdditionalFields: [],
      });
    }
    if (status === "PENDING" && reference.includes("additional_fields")) {
      return responseFor(reference, status, {
        mode: "ADDITIONAL_FIELDS",
        url: null,
        requiresAdditionalFields: ["billingZip", "billingCity"],
      });
    }
    return responseFor(reference, status);
  },
};
