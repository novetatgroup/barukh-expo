import { Stack } from "expo-router/stack";

export default function KYCLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocuCaptureScreen" />
      <Stack.Screen name="DocuTypeScreen" />
      <Stack.Screen name="selfiecaptureScreen" />
    </Stack>
  );
}
