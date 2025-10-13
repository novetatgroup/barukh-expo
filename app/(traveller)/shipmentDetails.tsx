import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ShipmentDetailsForm from "../components/forms/traveller/ShipmentDetailsForm";

const ShipmentDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <ShipmentDetailsForm
          itemId={(params.itemId as string) || 'N/A'}
          itemName={(params.itemName as string) || 'No Item'}
          shipperName={(params.shipperName as string) || 'No Item'}
          receiverName={(params.receiverName as string) || 'No Item'}
          fromLocation={(params.fromLocation as string) || 'Unknown'}
          toLocation={(params.toLocation as string) || 'Unknown'}
          status={(params.status as string)}
          progress={(params.progress as string) || 'N/A'}
          onBack={handleBack}   />
  );
};

export default ShipmentDetailsScreen;