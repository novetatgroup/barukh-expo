import { Stack } from "expo-router/stack";

export default function SenderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="coming-soon" />
      <Stack.Screen name="createShipment" />
      <Stack.Screen name="findingTraveller" />
      <Stack.Screen name="matchedTraveller" />
      <Stack.Screen name="travellerMatchDetails" />
    </Stack>
  );
}

