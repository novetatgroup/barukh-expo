import { Slot } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import Toast from "react-native-toast-message";
import { toastConfig } from "./components/ui/ToastConfig";
import { KYCProvider } from "./context/KYCContext";
import { ShipmentProvider } from "./context/ShipmentContext";


export default function RootLayout() {
  return (
    <AuthProvider>
      <KYCProvider>
        <ShipmentProvider>
          <Slot />
      
        <Toast config={toastConfig} />
        </ShipmentProvider>
        
      </KYCProvider> 
    </AuthProvider>
  );
}
