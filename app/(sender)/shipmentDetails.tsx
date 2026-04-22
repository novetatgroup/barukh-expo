import ShipmentDetailsForm from "@/components/forms/shipments/ShipmentDetailsForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

const SenderShipmentDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ShipmentDetailsForm
      role="sender"
      orderId={(params.orderId as string) || "#01-BK1624"}
      itemId={(params.itemId as string) || "#BK1624"}
      itemName={(params.itemName as string) || "MacBook Pro"}
      progress={(params.progress as string) || "Delivered"}
      expectedDelivery={(params.expectedDelivery as string) || "Jul 30"}
      shipmentCost={(params.shipmentCost as string) || "$10.00"}
      insuranceFee={(params.insuranceFee as string) || "$3.20"}
      serviceFee={(params.serviceFee as string) || "$1.50"}
      onBack={() => router.back()}
    />
  );
};

export default SenderShipmentDetailsScreen;
