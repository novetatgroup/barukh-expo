import { Stack } from "expo-router/stack";

export default function SenderLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
    </Stack>
  );
}

