import ShipmentCodeConfirmationScreen from "@/components/forms/traveller/ShipmentCodeConfirmationScreen";
import { AuthContext } from "@/context/AuthContext";
import { travellerService } from "@/services/travellerService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert } from "react-native";

const ConfirmDeliveryScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const params = useLocalSearchParams<{
    shipmentId?: string;
    itemId?: string;
    itemName?: string;
    progress?: string;
    packageUploaded?: string;
    confirmPickUpCompleted?: string;
    tripStarted?: string;
    verificationCompleted?: string;
    deliveryPhotoUploaded?: string;
    confirmDeliveryCompleted?: string;
    deliveryPhotoKey?: string;
  }>();

  const baseParams = {
    shipmentId: params.shipmentId || "",
    itemId: params.itemId || "#BK1624",
    itemName: params.itemName || "MacBook Pro",
    progress: params.progress || "In Transit",
    packageUploaded: params.packageUploaded || "false",
    confirmPickUpCompleted: params.confirmPickUpCompleted || "false",
    tripStarted: params.tripStarted || "false",
    verificationCompleted: params.verificationCompleted || "false",
    deliveryPhotoUploaded: params.deliveryPhotoUploaded || "false",
    confirmDeliveryCompleted: params.confirmDeliveryCompleted || "false",
    deliveryPhotoKey: params.deliveryPhotoKey || "",
  };

  const handleSubmit = async (code: string) => {
    if (!params.shipmentId) {
      Alert.alert("Missing shipment", "No shipment was provided for delivery confirmation.");
      return;
    }

    if (!params.deliveryPhotoKey) {
      Alert.alert("Missing delivery photo", "Upload the delivery photo before confirming delivery.");
      return;
    }

    if (!accessToken) {
      Alert.alert("Authentication required", "Please sign in and try again.");
      return;
    }

    setSubmitting(true);
    const result = await travellerService.confirmItemDelivery(
      {
        code,
        shipmentId: params.shipmentId,
        deliveryPhotoKey: params.deliveryPhotoKey,
      },
      accessToken
    );
    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Invalid delivery code", result.error || "Please confirm the code and try again.");
      return;
    }

    router.push({
      pathname: "/(traveller)/trackingDetails",
      params: {
        ...baseParams,
        progress: "Delivered",
        confirmDeliveryCompleted: "true",
      },
    });
  };

  return (
    <ShipmentCodeConfirmationScreen
      title="Confirm delivery"
      screenTitle="Confirm Delivery"
      subtitle="After the sender approves the proof photo and reads out the delivery code, enter it here to finalize the shipment."
      buttonLabel="Confirm Delivery"
      submitting={submitting}
      onBack={() => router.back()}
      onSubmit={handleSubmit}
    />
  );
};

export default ConfirmDeliveryScreen;
