import TravellerMatchingScreen from "@/components/forms/sender/TravellerMatchingScreen";
import { AuthContext } from "@/context/AuthContext";
import { useTravellerMatching } from "@/hooks/useTravellerMatching";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect } from "react";

const FindingTravellerScreen = () => {
  const { packageId, senderId } = useLocalSearchParams<{
    packageId?: string;
    senderId?: string;
  }>();
  const { accessToken, userId } = useContext(AuthContext);
  const matching = useTravellerMatching({ packageId, senderId, userId, accessToken });

  useEffect(() => {
    if (!matching.confirmedMatch) {
      return;
    }

    const { shipment, trip } = matching.confirmedMatch;
    const travellerName = `${trip.travellerFirstName} ${trip.travellerLastName}`.trim();

    router.replace({
      pathname: "/(sender)/matchedTraveller",
      params: {
        shipmentId: shipment.id,
        packageId: packageId || "",
        travellerUserId: shipment.traveller.userId,
        travellerName,
      },
    });
  }, [matching.confirmedMatch, packageId]);

  return (
    <TravellerMatchingScreen
      state={matching.state}
      currentRadius={matching.currentRadius}
      matchedTrip={matching.matchedTrip}
      errorMessage={matching.errorMessage}
      shipmentMessage={matching.shipmentMessage}
      onRetrySearch={matching.retrySearch}
      onRetryShipment={matching.retryShipment}
      onGoHome={() => router.replace("/(tabs)/home")}
    />
  );
};

export default FindingTravellerScreen;
