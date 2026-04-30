import CategoryDetailsForm from "@/components/forms/shipments/CategoryDetailsForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

const TravellerRequestDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const travellerName = (params.travellerName as string) || "Traveller";
  const requestedItem = (params.requestedItem as string) || "Package";

  return (
    <CategoryDetailsForm
      headerTitle="Traveller Request"
      title={travellerName}
      subtitle={requestedItem}
      status={(params.requestStatus as string) || "New"}
      icon="mail-unread-outline"
      iconBackground="#EBF2F1"
      rows={[
        { label: "Request ID :", value: (params.requestId as string) || "N/A" },
        { label: "Pickup :", value: (params.proposedPickup as string) || "Unknown" },
        { label: "Payout Offer :", value: (params.payoutOffer as string) || "$0.00" },
        { label: "Request Type :", value: "Traveller Request" },
      ]}
      onBack={() => router.back()}
    />
  );
};

export default TravellerRequestDetailsScreen;
