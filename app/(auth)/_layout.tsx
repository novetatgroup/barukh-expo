import { Stack } from "expo-router/stack";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="verifyOtpScreen" options={{ headerShown: false }} />
      <Stack.Screen name="roleSelection" options={{ headerShown: false }} />
    </Stack>
  );
}
