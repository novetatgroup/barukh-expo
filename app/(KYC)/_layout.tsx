import { Stack } from "expo-router/stack";

export default function KYCLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="docuCaptureScreen" />
      <Stack.Screen name="docuTypeScreen" />
      <Stack.Screen name="selfieCaptureScreen" />
      <Stack.Screen name="KYCLanding" />
      <Stack.Screen name="phoneOtpScreen" />
      <Stack.Screen name="addDetailsScreen" />
      <Stack.Screen name="verifyPhoneNoScreen" />
    </Stack>
  );
}
