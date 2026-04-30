import type { ShipmentDetails } from "@/services/senderService";

export type ShipmentStage = "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

const stageRank: Record<ShipmentStage, number> = {
  PENDING: 0,
  PICKED_UP: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
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
