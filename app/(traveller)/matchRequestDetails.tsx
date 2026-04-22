import CategoryDetailsForm from "@/components/forms/shipments/CategoryDetailsForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

const MatchRequestDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const senderName = (params.senderName as string) || "Sender";
  const packageName = (params.packageName as string) || "Package";
  const pickupCity = (params.pickupCity as string) || "Unknown";
  const destinationCity = (params.destinationCity as string) || "Unknown";

  return (
    <CategoryDetailsForm
      headerTitle="Match Request"
      title={senderName}
      subtitle={packageName}
      status={(params.reward as string) || "Reward"}
      icon="cube-outline"
      iconBackground="#EBF2F1"
      rows={[
        { label: "Pickup :", value: pickupCity },
        { label: "Destination :", value: destinationCity },
        { label: "Weight :", value: (params.weightKg as string) || "N/A" },
        { label: "Route :", value: `${pickupCity} - ${destinationCity}` },
      ]}
      onBack={() => router.back()}
    />
  );
};

export default MatchRequestDetailsScreen;
