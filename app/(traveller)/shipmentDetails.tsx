import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ShipmentDetailsForm from "@/components/forms/traveller/ShipmentDetailsForm";

const ShipmentDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <ShipmentDetailsForm
      itemId={(params.itemId as string) || "#BK1624"}
      shipperName={(params.shipperName as string) || "James Lutalo"}
      receiverName={(params.receiverName as string) || "Sanyu Twine"}
      itemName={(params.itemName as string) || "MacBook Pro"}
      fromLocation={(params.fromLocation as string) || "Ontario, Canada"}
      toLocation={(params.toLocation as string) || "Kampala, Uganda"}
      status={(params.status as string) || "Assigned"}
      progress={(params.progress as string) || "Delivered"}
      onBack={handleBack}
    />
  );
};

export default ShipmentDetailsScreen;
