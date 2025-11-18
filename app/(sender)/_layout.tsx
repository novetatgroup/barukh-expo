import { Stack } from "expo-router/stack";

export default function SenderLayout() {
  return (
    <Stack>
      <Stack.Screen name="coming-soon" options={{ headerShown: false }} />
    </Stack>
  );
}

