import React, { useContext, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MatchDetailsForm from '@/components/forms/traveller/MatchDetailsForm';
import { AuthContext } from '@/context/AuthContext';
import { getPaymentExecutionMode } from '@/services/paymentConfig';
import { paymentMockService } from '@/services/paymentMockService';

const MatchDetailsScreen = () => {
  const router = useRouter();
  const { userId } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const mode = getPaymentExecutionMode();
  const suppliedShipmentId = params.shipmentId as string | undefined;
  const shipmentId = suppliedShipmentId || (mode === "mock" ? "mock-shipment-001" : "");
  const [actionMessage, setActionMessage] = useState<string | null>(
    shipmentId ? null : "This match is missing the shipment ID required for acceptance.",
  );

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = async () => {
    if (!shipmentId) {
      setActionMessage("This match is missing the shipment ID required for acceptance.");
      return;
    }
    if (mode !== "mock") {
      setActionMessage(
        "Real acceptance is blocked until the backend shipment-status contract is confirmed.",
      );
      return;
    }
    if (!userId) {
      setActionMessage("Your session is unavailable. Please log in again.");
      return;
    }
    await paymentMockService.markShipmentAccepted(userId, shipmentId);
    router.replace({
      pathname: "/(traveller)/acceptedShipmentDetails",
      params: {
        id: shipmentId,
        status: "Accepted",
        senderName: (params.matchedUserName as string) || "Sender",
        packageName: (params.itemName as string) || "Package",
        acceptanceCode: `MOCK-${shipmentId.slice(-4).toUpperCase()}`,
        pickupPoint: (params.fromLocation as string) || "Pickup point",
        handoffDate: "Pending",
      },
    });
  };

  const handleDecline = async () => {
    if (!shipmentId) {
      setActionMessage("This match is missing the shipment ID required for decline.");
      return;
    }
    if (mode === "mock") {
      if (userId) {
        await paymentMockService.clearShipmentAcceptance(userId, shipmentId);
      }
      router.back();
      return;
    }
    setActionMessage(
      "Real decline is blocked until the backend shipment-status contract is confirmed.",
    );
  };

  return (
    <MatchDetailsForm
      matchedUserName={(params.matchedUserName as string) || 'Unknown User'}
      matchedUserImage={params.matchedUserImage as string}
      itemName={(params.itemName as string) || 'No Item'}
      category={(params.category as string) || 'Uncategorized'}
      fromLocation={(params.fromLocation as string) || 'Unknown'}
      toLocation={(params.toLocation as string) || 'Unknown'}
      onBack={handleBack}
      onConfirm={() => void handleConfirm()}
      onDecline={() => void handleDecline()}
      actionMessage={actionMessage}
    />
  );
};

export default MatchDetailsScreen;
