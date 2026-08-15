import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import ToastManager from "toastify-react-native";
import { toastConfig } from "@/components/ui/AppToast";
import { Theme } from "@/constants/Theme";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { KYCProvider } from "@/context/KYCContext";
import { RoleProvider } from "@/context/RoleContext";
import { ShipmentProvider } from "@/context/ShipmentContext";
import { PaymentProvider } from "@/context/PaymentContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const hasBottomTabBar = segments[0] === "(tabs)";
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
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
            <PaymentProvider>
              <ChatProvider>
                <Slot />
                <ToastManager
                  config={toastConfig}
                  animationStyle="slide"
                  showProgressBar={false}
                  position="bottom"
                  bottomOffset={hasBottomTabBar ? 100 : Theme.spacing.lg}
                />
              </ChatProvider>
            </PaymentProvider>
          </ShipmentProvider>
        </KYCProvider>
      </RoleProvider>
    </AuthProvider>
  );
}
