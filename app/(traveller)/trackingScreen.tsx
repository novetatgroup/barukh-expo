import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TrackingDetailsForm from '../components/forms/traveller/Trackingform';

const TrackingDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/(traveller)/myShipments');
  };

  return (
    <TrackingDetailsForm
      trackingNumber={(params.trackingNumber as string) || '#N/A'}
      itemName={(params.itemName as string) || 'Unknown Item'}
      currentStep={parseInt(params.currentStep as string) || 0}
      onClose={handleClose}
      onBack={handleBack}
    />
  );
};

export default TrackingDetailsScreen;