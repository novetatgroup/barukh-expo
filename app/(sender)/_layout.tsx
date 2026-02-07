import { Stack } from "expo-router/stack";

export default function SenderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="coming-soon" />
    </Stack>
  );
}

