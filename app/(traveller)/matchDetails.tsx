import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MatchDetailsForm from '../components/forms/traveller/MatchDetailsForm';

const MatchDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.back();
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
    />
  );
};

export default MatchDetailsScreen;