import ShipmentDetailsForm from "@/components/forms/traveller/ShipmentDetailsForm";
import { AuthContext } from "@/context/AuthContext";
import { senderService, ShipmentDetails } from "@/services/senderService";
import {
  formatShipmentStatus,
  getShipmentDeliveryPhotoUrl,
} from "@/utils/shipmentTracking";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";

const ShipmentDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const params = useLocalSearchParams();
  const shipmentId =
    (params.shipmentId as string | undefined) || (params.id as string | undefined);
  const itemId = shipment?.packageId
    ? `#${shipment.packageId.slice(0, 8).toUpperCase()}`
    : (params.itemId as string) || "#BK1624";
  const itemName = shipment?.package?.name || (params.itemName as string) || "MacBook Pro";
  const fromLocation =
    shipment?.package?.originCity ||
    shipment?.travel?.originCity ||
    (params.fromLocation as string) ||
    "Ontario, Canada";
  const toLocation =
    shipment?.package?.destinationCity ||
    shipment?.travel?.destinationCity ||
    (params.toLocation as string) ||
    "Kampala, Uganda";
  const status = shipment?.status || (params.status as string) || "Assigned";
  const progress = formatShipmentStatus(shipment?.status || (params.progress as string) || status);
  const deliveryPhotoUrl = getShipmentDeliveryPhotoUrl(shipment);

  const fetchShipment = useCallback(async () => {
    if (!shipmentId || !accessToken) return;

    const result = await senderService.getShipment(shipmentId, accessToken);

    if (result.ok && result.data) {
      setShipment(result.data);
    }
  }, [accessToken, shipmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchShipment();
    }, [fetchShipment])
  );

  const handleBack = () => {
    router.replace("/(tabs)/shipments");
  };

  return (
    <ShipmentDetailsForm
      headerTitle={(params.title as string) || "Shipment Details"}
      shipmentId={shipmentId}
      itemId={itemId}
      shipperName={(params.shipperName as string) || "James Lutalo"}
      receiverName={(params.receiverName as string) || "Sanyu Twine"}
      itemName={itemName}
      fromLocation={fromLocation}
      toLocation={toLocation}
      status={status}
      progress={progress}
      deliveryPhotoUrl={deliveryPhotoUrl}
      onBack={handleBack}
    />
  );
};

export default ShipmentDetailsScreen;
