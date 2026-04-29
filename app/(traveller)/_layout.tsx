import { Stack } from "expo-router/stack";

export default function TravellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="travellerDetails" />
      <Stack.Screen name="acceptedShipmentDetails" />
      <Stack.Screen name="packageDetails" />
      <Stack.Screen name="matchDetails" />
      <Stack.Screen name="matchRequestDetails" />
      <Stack.Screen name="shipmentDetails" />
      <Stack.Screen name="trackingDetails" />
      <Stack.Screen name="confirmPickUp" />
      <Stack.Screen name="confirmDelivery" />
      <Stack.Screen name="startTrip" />
      <Stack.Screen name="verificationScreen" />
      <Stack.Screen name="deliveryUpload" />
    </Stack>
  );
}
