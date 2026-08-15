import type { ShipmentDetails } from "@/services/senderService";

export type ShipmentStage = "PENDING" |  "QUOTE_INITIATED"  | "QUOTE_SENT" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

const stageRank: Record<ShipmentStage, number> = {
  PENDING: 0,
  QUOTE_INITIATED: 1,
  QUOTE_SENT: 2,
  PICKED_UP: 3,
  IN_TRANSIT: 4,
  DELIVERED: 5,
};

export const normalizeShipmentStatus = (status?: string | null): ShipmentStage => {
  const normalized = (status || "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  if (normalized === "PICKED_UP" || normalized === "PICKEDUP") {
    return "PICKED_UP";
  }

  if (normalized === "IN_TRANSIT" || normalized === "INTRANSIT") {
    return "IN_TRANSIT";
  }

  if (normalized === "DELIVERED") {
    return "DELIVERED";
  }

  return "PENDING";
};

export const hasReachedShipmentStage = (
  status: string | null | undefined,
  stage: ShipmentStage
) => stageRank[normalizeShipmentStatus(status)] >= stageRank[stage];

export const formatShipmentStatus = (status?: string | null) => {
  const stage = normalizeShipmentStatus(status);

  if (stage === "PICKED_UP") return "Picked Up";
  if (stage === "IN_TRANSIT") return "In Transit";
  if (stage === "DELIVERED") return "Delivered";

  return "Pending";
};

export const getShipmentDeliveryPhotoUrl = (
  shipment?: ShipmentDetails | null
) => shipment?.deliveryPhotoUrl || undefined;
