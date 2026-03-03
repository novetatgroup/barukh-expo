import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import ToastManager from "toastify-react-native";
import { AuthProvider } from "./context/AuthContext";
import { KYCProvider } from "./context/KYCContext";
import { RoleProvider } from "./context/RoleContext";
import { ShipmentProvider } from "./context/ShipmentContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Italic": require("../assets/fonts/Inter-Italic.ttf"),
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RoleProvider>
        <KYCProvider>
          <ShipmentProvider>
            <Slot />
            <ToastManager />
          </ShipmentProvider>
        </KYCProvider>
      </RoleProvider>
    </AuthProvider>
  );
}
