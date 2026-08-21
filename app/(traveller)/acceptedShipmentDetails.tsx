import CategoryDetailsForm from "@/components/forms/shipments/CategoryDetailsForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

const AcceptedShipmentDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const senderName = (params.senderName as string) || "Sender";
  const packageName = (params.packageName as string) || "Package";

  return (
    <CategoryDetailsForm
      headerTitle="Accepted Package"
      title={senderName}
      subtitle={packageName}
      status={(params.status as string) || "Accepted"}
      icon="checkmark-circle-outline"
      rows={[
        { label: "Acceptance ID :", value: (params.acceptanceCode as string) || "N/A" },
        { label: "Handoff Date :", value: (params.handoffDate as string) || "Unknown" },
        { label: "Pickup Point :", value: (params.pickupPoint as string) || "Unknown" },
        { label: "Category :", value: "Accepted" },
      ]}
      onBack={() => router.back()}
    />
  );
};

export default AcceptedShipmentDetailsScreen;
