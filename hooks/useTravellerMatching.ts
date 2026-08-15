import {
  AutoAssignedTrip,
  AutoAssignResponse,
  ShipmentDetails,
  senderService,
} from "@/services/senderService";
import { useCallback, useEffect, useRef, useState } from "react";

export type TravellerMatchingState =
  | "searching"
  | "resolving-shipment"
  | "shipment-pending"
  | "empty"
  | "error";

export interface ConfirmedTravellerMatch {
  trip: AutoAssignedTrip;
  shipment: ShipmentDetails;
}

interface UseTravellerMatchingParams {
  packageId?: string;
  senderId?: string;
  userId?: string | null;
  accessToken: string | null;
}

export const SEARCH_RADII_KM = [7, 8, 9, 10] as const;
const SHIPMENT_RECOVERY_DELAYS_MS = [0, 750, 1500] as const;

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isAutoAssignedTrip = (value: unknown): value is AutoAssignedTrip => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.travellerId) &&
    isNonEmptyString(value.travellerFirstName) &&
    isNonEmptyString(value.travellerLastName) &&
    isFiniteNumber(value.originLat) &&
    isFiniteNumber(value.originLon) &&
    isFiniteNumber(value.destinationLat) &&
    isFiniteNumber(value.destinationLon) &&
    isFiniteNumber(value.originDistanceKm) &&
    value.originDistanceKm >= 0 &&
    isFiniteNumber(value.destinationDistanceKm) &&
    value.destinationDistanceKm >= 0 &&
    isFiniteNumber(value.remainingCapacity) &&
    value.remainingCapacity >= 0 &&
    isFiniteNumber(value.maxWeightKg) &&
    value.maxWeightKg >= 0 &&
    isFiniteNumber(value.maxLengthCm) &&
    value.maxLengthCm >= 0 &&
    isFiniteNumber(value.maxWidthCm) &&
    value.maxWidthCm >= 0 &&
    isFiniteNumber(value.maxHeightCm) &&
    value.maxHeightCm >= 0
  );
};

const parseAutoAssignResponse = (value: unknown): AutoAssignResponse | null => {
  if (!isRecord(value) || !("trip" in value)) {
    return null;
  }

  if (value.trip === null) {
    return { trip: null };
  }

  return isAutoAssignedTrip(value.trip) ? { trip: value.trip } : null;
};

export const useTravellerMatching = ({
  packageId,
  senderId,
  userId,
  accessToken,
}: UseTravellerMatchingParams) => {
  const [state, setState] = useState<TravellerMatchingState>("searching");
  const [currentRadius, setCurrentRadius] = useState<number>(SEARCH_RADII_KM[0]);
  const [matchedTrip, setMatchedTrip] = useState<AutoAssignedTrip | null>(null);
  const [confirmedMatch, setConfirmedMatch] = useState<ConfirmedTravellerMatch | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [shipmentMessage, setShipmentMessage] = useState("");

  const mountedRef = useRef(true);
  const requestVersionRef = useRef(0);
  const resolvedSenderIdRef = useRef<string | null>(senderId ?? null);

  const recoverShipment = useCallback(
    async (trip: AutoAssignedTrip, activeSenderId: string, requestVersion: number) => {
      if (!packageId || !accessToken) {
        setErrorMessage("Missing package, sender, or authentication information.");
        setState("error");
        return;
      }

      setState("resolving-shipment");
      setShipmentMessage("");
      let recoveryMessage = "Your match is confirmed, but shipment details are still being prepared.";

      for (const delayMs of SHIPMENT_RECOVERY_DELAYS_MS) {
        if (delayMs > 0) {
          await wait(delayMs);
        }

        if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
          return;
        }

        const result = await senderService.getSenderShipments(activeSenderId, accessToken);

        if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
          return;
        }

        if (result.ok && result.data) {
          const shipments: ShipmentDetails[] = Array.isArray(result.data)
            ? result.data
            : result.data.data ?? [];
          const shipment = shipments.find(
            (item) => item.packageId === packageId && item.tripId === trip.id,
          );

          if (shipment) {
            setConfirmedMatch({ trip, shipment });
            return;
          }
        } else if (result.error) {
          recoveryMessage = result.error;
        }
      }

      setShipmentMessage(recoveryMessage);
      setState("shipment-pending");
    },
    [accessToken, packageId],
  );

  const search = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;

    setState("searching");
    setCurrentRadius(SEARCH_RADII_KM[0]);
    setMatchedTrip(null);
    setConfirmedMatch(null);
    setErrorMessage("");
    setShipmentMessage("");

    if (!packageId || !accessToken) {
      setErrorMessage("Missing package, sender, or authentication information.");
      setState("error");
      return;
    }

    let activeSenderId = senderId || resolvedSenderIdRef.current;
    if (!activeSenderId) {
      if (!userId) {
        setErrorMessage("Missing sender information. Please return home and try again.");
        setState("error");
        return;
      }

      const senderResult = await senderService.getSender(userId, accessToken);

      if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
        return;
      }

      if (!senderResult.ok || !senderResult.data?.senderId) {
        setErrorMessage(senderResult.error || "Unable to retrieve your sender profile.");
        setState("error");
        return;
      }

      activeSenderId = senderResult.data.senderId;
      resolvedSenderIdRef.current = activeSenderId;
    }

    for (const radiusKm of SEARCH_RADII_KM) {
      if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
        return;
      }

      setCurrentRadius(radiusKm);
      const result = await senderService.autoAssign(packageId, radiusKm, accessToken);

      if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
        return;
      }

      if (result.status === 404) {
        continue;
      }

      if (!result.ok) {
        setErrorMessage(result.error || "Unable to search for a compatible traveller.");
        setState("error");
        return;
      }

      const response = parseAutoAssignResponse(result.data);
      if (!response) {
        setErrorMessage("The matching service returned an unsupported response. Please try again.");
        setState("error");
        return;
      }

      if (!response.trip) {
        continue;
      }

      setMatchedTrip(response.trip);
      await recoverShipment(response.trip, activeSenderId, requestVersion);
      return;
    }

    setState("empty");
  }, [accessToken, packageId, recoverShipment, senderId, userId]);

  useEffect(() => {
    mountedRef.current = true;
    void search();

    return () => {
      mountedRef.current = false;
      requestVersionRef.current += 1;
    };
  }, [search]);

  const retrySearch = useCallback(() => {
    void search();
  }, [search]);

  const retryShipment = useCallback(() => {
    const activeSenderId = senderId || resolvedSenderIdRef.current;
    if (!matchedTrip || !activeSenderId) {
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    setConfirmedMatch(null);
    void recoverShipment(matchedTrip, activeSenderId, requestVersion);
  }, [matchedTrip, recoverShipment, senderId]);

  return {
    state,
    currentRadius,
    matchedTrip,
    confirmedMatch,
    errorMessage,
    shipmentMessage,
    retrySearch,
    retryShipment,
  };
};
