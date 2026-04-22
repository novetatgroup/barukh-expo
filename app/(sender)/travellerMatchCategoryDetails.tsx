import CategoryDetailsForm from "@/components/forms/shipments/CategoryDetailsForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

const TravellerMatchCategoryDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const travellerName = (params.travellerName as string) || "Traveller";
  const parcelName = (params.parcelName as string) || "Package";

  return (
    <CategoryDetailsForm
      headerTitle="Traveller Match"
      title={travellerName}
      subtitle={parcelName}
      status={(params.matchScore as string) || "Matched"}
      icon="person"
      iconBackground="#F5D6A8"
      rows={[
        { label: "Route :", value: (params.route as string) || "Unknown" },
        { label: "Departure :", value: (params.departureWindow as string) || "Unknown" },
        { label: "Rating :", value: (params.rating as string) || "5.0" },
        { label: "Match Type :", value: "Traveller Match" },
      ]}
      onBack={() => router.back()}
    />
  );
};

export default TravellerMatchCategoryDetailsScreen;
