import { Stack } from "expo-router/stack";

export default function TravellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="travellerDetails" />
      <Stack.Screen name="packageDetails" />
      <Stack.Screen name="home" />
      <Stack.Screen name="myShipments" />
      <Stack.Screen name="matchDetails" />
      <Stack.Screen name="shipmentDetails" />
      <Stack.Screen name="startTrip" />
      <Stack.Screen name="deliveryUpload" />
    </Stack>
  );
}
