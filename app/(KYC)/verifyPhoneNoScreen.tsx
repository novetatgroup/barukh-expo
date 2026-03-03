import React from 'react';
import { View, StyleSheet } from 'react-native';
import VerifyPhoneNoForm from '@/app/components/forms/KYC/VerifyPhoneNoForm';
import Theme from '@/app/constants/Theme';
import { router } from 'expo-router';
import { Country } from '@/app/components/ui/PhoneNumberInput';

const VerifyPhoneNoScreen = () => {
  const handleSubmit = (phoneNumber: string, country: Country) => {
    console.log('Phone Number submitted:', phoneNumber, country);
    router.push("/(KYC)/phoneOtpScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <VerifyPhoneNoForm onSubmit={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export default VerifyPhoneNoScreen;
