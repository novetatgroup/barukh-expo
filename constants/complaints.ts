export const COMPLAINT_TYPES = {
  SHIPMENT: "SHIPMENT",
  TRAVELLER: "TRAVELLER",
  SENDER: "SENDER",
  OTHER: "OTHER",
} as const;

export type ComplaintType = (typeof COMPLAINT_TYPES)[keyof typeof COMPLAINT_TYPES];

export const COMPLAINT_TYPE_OPTIONS: { label: string; value: ComplaintType }[] = [
  { label: "Shipment", value: COMPLAINT_TYPES.SHIPMENT },
  { label: "Traveller", value: COMPLAINT_TYPES.TRAVELLER },
  { label: "Sender", value: COMPLAINT_TYPES.SENDER },
  { label: "Other", value: COMPLAINT_TYPES.OTHER },
];

export const COMPLAINT_REASONS = {
  ITEM_DAMAGED: "ITEM_DAMAGED",
  ITEM_LOST: "ITEM_LOST",
  ITEM_NOT_AS_DESCRIBED: "ITEM_NOT_AS_DESCRIBED",
  PAYMENT_ISSUE: "PAYMENT_ISSUE",
  FRAUD_SCAM: "FRAUD_SCAM",
  HARASSMENT_ABUSE: "HARASSMENT_ABUSE",
  UNSAFE_BEHAVIOR: "UNSAFE_BEHAVIOR",
  NO_SHOW: "NO_SHOW",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  APP_BUG: "APP_BUG",
  OTHER: "OTHER",
} as const;

export type ComplaintReason = (typeof COMPLAINT_REASONS)[keyof typeof COMPLAINT_REASONS];

export const COMPLAINT_REASON_OPTIONS: { label: string; value: ComplaintReason }[] = [
  { label: "Item damaged", value: COMPLAINT_REASONS.ITEM_DAMAGED },
  { label: "Item lost", value: COMPLAINT_REASONS.ITEM_LOST },
  { label: "Item not as described", value: COMPLAINT_REASONS.ITEM_NOT_AS_DESCRIBED },
  { label: "Payment issue", value: COMPLAINT_REASONS.PAYMENT_ISSUE },
  { label: "Fraud / scam", value: COMPLAINT_REASONS.FRAUD_SCAM },
  { label: "Harassment / abuse", value: COMPLAINT_REASONS.HARASSMENT_ABUSE },
  { label: "Unsafe behavior", value: COMPLAINT_REASONS.UNSAFE_BEHAVIOR },
  { label: "No-show", value: COMPLAINT_REASONS.NO_SHOW },
  { label: "Inappropriate content", value: COMPLAINT_REASONS.INAPPROPRIATE_CONTENT },
  { label: "App bug", value: COMPLAINT_REASONS.APP_BUG },
  { label: "Other", value: COMPLAINT_REASONS.OTHER },
];
