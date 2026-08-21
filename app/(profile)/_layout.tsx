import { Stack } from "expo-router/stack";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="editProfile" />
      <Stack.Screen name="switchProfile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="paymentDetails" />
      <Stack.Screen name="payoutAccounts" />
      <Stack.Screen name="helpSupport" />
    </Stack>
  );
}
