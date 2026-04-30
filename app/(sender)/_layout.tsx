import { Stack } from "expo-router/stack";

export default function SenderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="coming-soon" />
      <Stack.Screen name="createShipment" />
      <Stack.Screen name="findingTraveller" />
      <Stack.Screen name="matchedTraveller" />
      <Stack.Screen name="confirmOrder" />
      <Stack.Screen name="enterTrackingNumber" />
      <Stack.Screen name="modeOfPayment" />
      <Stack.Screen name="payScreen" />
      <Stack.Screen name="shipmentDetails" />
      <Stack.Screen name="shareDeliveryCode" />
      <Stack.Screen name="sharePickupCode" />
      <Stack.Screen name="trackingDetails" />
      <Stack.Screen name="verificationScreen" />
      <Stack.Screen name="travellerMatchCategoryDetails" />
      <Stack.Screen name="travellerMatchDetails" />
      <Stack.Screen name="travellerRequestDetails" />
      <Stack.Screen name="uploadReceipt" />
    </Stack>
  );
}
