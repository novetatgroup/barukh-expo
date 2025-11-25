import React from 'react';
import { View, StyleSheet } from 'react-native';
import VerifyPhoneNoForm from '@/app/components/forms/KYC/VerifyPhoneNoForm';
import Theme from '@/app/constants/Theme';
import { router } from 'expo-router';
import {
  ICountry,
} from 'react-native-international-phone-number';
const VerifyPhoneNoScreen = () => {
  //TODO: implement api call
  const handleSubmit = (phoneNumber: string, country: ICountry | null) => {
    console.log('Phone Number submitted:', phoneNumber, country);

    router.push("/(KYC)/phoneOtpScreen")
  }
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export default VerifyPhoneNoScreen;
