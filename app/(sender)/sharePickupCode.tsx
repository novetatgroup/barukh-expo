import ShareShipmentCodeScreen from "@/components/forms/sender/ShareShipmentCodeScreen";
import { AuthContext } from "@/context/AuthContext";
import { senderService } from "@/services/senderService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext } from "react";

type TrackingParams = {
  shipmentId?: string;
  orderId?: string;
  itemId?: string;
  itemName?: string;
  receiptUploaded?: string;
  trackingEntered?: string;
  pickupCodeShared?: string;
  deliveryCodeShared?: string;
  orderConfirmed?: string;
  verificationCompleted?: string;
};

const SharePickupCodeRoute = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams<TrackingParams>();

  const trackingParams = {
    shipmentId: params.shipmentId || "",
    orderId: params.orderId || "#01-BK1624",
    itemId: params.itemId || "#BK1624",
    itemName: params.itemName || "MacBook Pro",
    receiptUploaded: params.receiptUploaded || "false",
    trackingEntered: params.trackingEntered || "false",
    pickupCodeShared: params.pickupCodeShared || "false",
    deliveryCodeShared: params.deliveryCodeShared || "false",
    orderConfirmed: params.orderConfirmed || "false",
    verificationCompleted: params.verificationCompleted || "false",
  };

  const handleBack = (hasShared: boolean) => {
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: {
        ...trackingParams,
        pickupCodeShared: String(hasShared),
      },
    });
  };

  const handleFetchCode = async () => {
    console.log({code: 'testing....',shipmentId: trackingParams.shipmentId,
      accessToken})
    if (!accessToken) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (!trackingParams.shipmentId) {
      throw new Error("This shipment does not have an ID yet.");
    }

    const response = await senderService.getPickupCode(
      trackingParams.shipmentId,
      accessToken
    );

    if (!response.ok || !response.data?.code) {
      throw new Error(response.error || "Unable to load the pickup code.");
    }

    return response.data.code;
  };

  return (
    <ShareShipmentCodeScreen
      codeType="pickup"
      itemName={trackingParams.itemName}
      shipmentId={trackingParams.shipmentId}
      initiallyShared={trackingParams.pickupCodeShared === "true"}
      onBack={handleBack}
      onFetchCode={handleFetchCode}
    />
  );
};

export default SharePickupCodeRoute;
