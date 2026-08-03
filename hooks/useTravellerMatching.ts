import {
  AssignTravellerResponse,
  MatchCandidate,
  MatchOptionsResponse,
  senderService,
} from "@/services/senderService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TravellerMatchingState = "loading" | "ready" | "empty" | "error";

export interface ConfirmedTravellerMatch {
  assignment: AssignTravellerResponse;
  candidate: MatchCandidate;
}

interface UseTravellerMatchingParams {
  packageId?: string;
  accessToken: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidDateString = (value: unknown): value is string =>
  isNonEmptyString(value) && !Number.isNaN(Date.parse(value));

const isMatchCandidate = (value: unknown): value is MatchCandidate => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.tripId) &&
    isNonEmptyString(value.travellerId) &&
    isNonEmptyString(value.travellerUserId) &&
    isNonEmptyString(value.travellerName) &&
    (value.rating === null ||
      (isFiniteNumber(value.rating) && value.rating >= 0 && value.rating <= 5)) &&
    isNonEmptyString(value.originCity) &&
    isNonEmptyString(value.destinationCity) &&
    isValidDateString(value.departureAt) &&
    isValidDateString(value.arrivalAt) &&
    isNonEmptyString(value.mode) &&
    isFiniteNumber(value.originDistanceKm) &&
    value.originDistanceKm >= 0 &&
    isFiniteNumber(value.destinationDistanceKm) &&
    value.destinationDistanceKm >= 0 &&
    isFiniteNumber(value.remainingCapacity) &&
    Number.isInteger(value.remainingCapacity) &&
    value.remainingCapacity >= 0 &&
    isFiniteNumber(value.matchScore) &&
    value.matchScore >= 0 &&
    value.matchScore <= 1
  );
};

const isMatchOptionsResponse = (value: unknown): value is MatchOptionsResponse => {
  if (!isRecord(value) || !isNonEmptyString(value.packageId)) {
    return false;
  }

  if (!Array.isArray(value.candidates) || value.candidates.length > 5) {
    return false;
  }

  const candidates = value.candidates;
  if (!candidates.every(isMatchCandidate)) {
    return false;
  }

  const tripIds = candidates.map((candidate) => candidate.tripId);
  if (new Set(tripIds).size !== tripIds.length) {
    return false;
  }

  if (candidates.length === 0) {
    return value.recommendedTripId === null;
  }

  return (
    isNonEmptyString(value.recommendedTripId) &&
    tripIds.includes(value.recommendedTripId)
  );
};

const isAssignTravellerResponse = (value: unknown): value is AssignTravellerResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.shipmentId) &&
    isNonEmptyString(value.status) &&
    isFiniteNumber(value.priceMinor) &&
    Number.isInteger(value.priceMinor) &&
    value.priceMinor >= 0 &&
    isNonEmptyString(value.currency)
  );
};

export const useTravellerMatching = ({
  packageId,
  accessToken,
}: UseTravellerMatchingParams) => {
  const [state, setState] = useState<TravellerMatchingState>("loading");
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [recommendedTripId, setRecommendedTripId] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const mountedRef = useRef(true);
  const requestVersionRef = useRef(0);
  const assigningRef = useRef(false);

  const loadMatches = useCallback(
    async (notice = "") => {
      const requestVersion = ++requestVersionRef.current;

      setState("loading");
      setErrorMessage("");
      setAssignmentError("");

      if (!packageId || !accessToken) {
        setCandidates([]);
        setRecommendedTripId(null);
        setSelectedTripId(null);
        setNoticeMessage("");
        setErrorMessage("Missing package or authentication information.");
        setState("error");
        return;
      }

      const result = await senderService.getMatchOptions(packageId, accessToken);

      if (!mountedRef.current || requestVersion !== requestVersionRef.current) {
        return;
      }

      if (!result.ok) {
        setCandidates([]);
        setRecommendedTripId(null);
        setSelectedTripId(null);
        setNoticeMessage("");
        setErrorMessage(result.error || "Unable to find compatible travellers.");
        setState("error");
        return;
      }

      if (!isMatchOptionsResponse(result.data) || result.data.packageId !== packageId) {
        setCandidates([]);
        setRecommendedTripId(null);
        setSelectedTripId(null);
        setNoticeMessage("");
        setErrorMessage("The matching service returned an invalid response. Please try again.");
        setState("error");
        return;
      }

      setCandidates(result.data.candidates);
      setRecommendedTripId(result.data.recommendedTripId);
      setSelectedTripId(result.data.recommendedTripId);
      setNoticeMessage(notice);

      if (result.data.candidates.length === 0) {
        setState("empty");
        return;
      }

      setState("ready");
    },
    [accessToken, packageId],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadMatches();

    return () => {
      mountedRef.current = false;
      requestVersionRef.current += 1;
    };
  }, [loadMatches]);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.tripId === selectedTripId) ?? null,
    [candidates, selectedTripId],
  );

  const selectCandidate = useCallback(
    (tripId: string) => {
      if (isAssigning || !candidates.some((candidate) => candidate.tripId === tripId)) {
        return;
      }

      setSelectedTripId(tripId);
      setAssignmentError("");
    },
    [candidates, isAssigning],
  );

  const confirmSelection = useCallback(async (): Promise<ConfirmedTravellerMatch | null> => {
    if (assigningRef.current || !selectedCandidate || !packageId || !accessToken) {
      return null;
    }

    assigningRef.current = true;
    setIsAssigning(true);
    setAssignmentError("");

    try {
      const result = await senderService.assignTraveller(
        { packageId, tripId: selectedCandidate.tripId },
        accessToken,
      );

      if (!mountedRef.current) {
        return null;
      }

      const unavailable =
        result.status === 409 || result.errorCode?.toLowerCase() === "candidate_unavailable";

      if (unavailable) {
        setIsAssigning(false);
        assigningRef.current = false;
        await loadMatches(
          "That traveller is no longer available. We refreshed your compatible matches.",
        );
        return null;
      }

      if (!result.ok) {
        setAssignmentError(result.error || "Unable to confirm this traveller. Please try again.");
        return null;
      }

      if (!isAssignTravellerResponse(result.data)) {
        setAssignmentError(
          "The shipment could not be confirmed because the assignment response was incomplete.",
        );
        return null;
      }

      return { assignment: result.data, candidate: selectedCandidate };
    } finally {
      assigningRef.current = false;
      if (mountedRef.current) {
        setIsAssigning(false);
      }
    }
  }, [accessToken, loadMatches, packageId, selectedCandidate]);

  const retry = useCallback(() => {
    void loadMatches();
  }, [loadMatches]);

  return {
    state,
    candidates,
    recommendedTripId,
    selectedTripId,
    selectedCandidate,
    errorMessage,
    noticeMessage,
    assignmentError,
    isAssigning,
    selectCandidate,
    confirmSelection,
    retry,
  };
};
