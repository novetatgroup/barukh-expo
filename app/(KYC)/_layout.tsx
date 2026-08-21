import { Stack } from "expo-router/stack";

export default function KYCLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="docuCaptureScreen" />
      <Stack.Screen name="docuTypeScreen" />
      <Stack.Screen name="selfieCaptureScreen" />
      <Stack.Screen name="KYCLanding" />
      {/* Phone number + OTP verification steps are temporarily disabled */}
      {/* <Stack.Screen name="phoneOtpScreen" /> */}
      <Stack.Screen name="addDetailsScreen" />
      {/* <Stack.Screen name="verifyPhoneNoScreen" /> */}
      <Stack.Screen name="verificationPendingScreen" />
      <Stack.Screen name="verifiedScreen" />
    </Stack>
  );
}
