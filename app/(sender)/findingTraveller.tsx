import TravellerMatchingScreen from "@/components/forms/sender/TravellerMatchingScreen";
import { AuthContext } from "@/context/AuthContext";
import { useTravellerMatching } from "@/hooks/useTravellerMatching";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";

const FindingTravellerScreen = () => {
  const { packageId } = useLocalSearchParams<{ packageId?: string }>();
  const { accessToken } = useContext(AuthContext);
  const matching = useTravellerMatching({ packageId, accessToken });

  const handleConfirm = async () => {
    const confirmedMatch = await matching.confirmSelection();
    if (!confirmedMatch) {
      return;
    }

    const { assignment, candidate } = confirmedMatch;
    router.replace({
      pathname: "/(sender)/matchedTraveller",
      params: {
        shipmentId: assignment.shipmentId,
        packageId: packageId || "",
        travellerUserId: candidate.travellerUserId,
        travellerName: candidate.travellerName,
        rating: candidate.rating === null ? "" : String(candidate.rating),
      },
    });
  };

  return (
    <TravellerMatchingScreen
      state={matching.state}
      candidates={matching.candidates}
      recommendedTripId={matching.recommendedTripId}
      selectedTripId={matching.selectedTripId}
      errorMessage={matching.errorMessage}
      noticeMessage={matching.noticeMessage}
      assignmentError={matching.assignmentError}
      isAssigning={matching.isAssigning}
      onSelectCandidate={matching.selectCandidate}
      onConfirm={handleConfirm}
      onRetry={matching.retry}
      onBack={() => router.back()}
      onGoHome={() => router.replace("/(tabs)/home")}
    />
  );
};

export default FindingTravellerScreen;
