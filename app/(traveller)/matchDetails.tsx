import MatchDetailsForm from '@/components/forms/traveller/MatchDetailsForm';
import { AuthContext } from '@/context/AuthContext';
import { senderService } from '@/services/senderService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';

const MatchDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const shipmentId = (params.shipmentId as string | undefined) || "";
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
    if (!accessToken) {
      setActionMessage("Your session is unavailable. Please log in again.");
      return;
    }
    // TODO(izaiah): confirm the canonical accept-shipment endpoint.
    // Currently uses the traveller-confirm-transport endpoint as a placeholder.
    const result = await senderService.travellerConfirmShipment(shipmentId, accessToken);
    if (!result.ok) {
      setActionMessage(result.error || "Unable to accept this shipment.");
      return;
    }
    router.replace({
      pathname: "/(traveller)/acceptedShipmentDetails",
      params: {
        id: shipmentId,
        status: "Accepted",
        senderName: (params.matchedUserName as string) || "—",
        packageName: (params.itemName as string) || "—",
        pickupPoint: (params.fromLocation as string) || "—",
        handoffDate: "Pending",
      },
    });
  };

  const handleDecline = async () => {
    if (!shipmentId) {
      setActionMessage("This match is missing the shipment ID required for decline.");
      return;
    }
    // TODO(izaiah): backend contract for match decline not yet defined.
    router.back();
  };

  return (
    <MatchDetailsForm
      matchedUserName={(params.matchedUserName as string) || '—'}
      matchedUserImage={params.matchedUserImage as string}
      itemName={(params.itemName as string) || '—'}
      category={(params.category as string) || '—'}
      fromLocation={(params.fromLocation as string) || '—'}
      toLocation={(params.toLocation as string) || '—'}
      onBack={handleBack}
      onConfirm={() => void handleConfirm()}
      onDecline={() => void handleDecline()}
      actionMessage={actionMessage}
    />
  );
};

export default MatchDetailsScreen;
