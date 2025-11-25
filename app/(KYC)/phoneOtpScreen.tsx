import React from "react";
import { StyleSheet, View } from "react-native";
import VerifyPhoneOtpForm from "../components/forms/KYC/PhoneOtp";
import { router } from "expo-router";

const PhoneOtpScreen = () => {
  //TODO: implement api call
  const handleVerifyOtp = async ({ otp}: { otp: string }) => {
    router.push("/(KYC)/addDetailsScreen")
  };
  
  return (
    <View style={styles.container}>
      <VerifyPhoneOtpForm onSubmit={handleVerifyOtp} length={6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
});

export default PhoneOtpScreen;