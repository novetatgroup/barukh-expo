import { Slot } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import Toast from "react-native-toast-message";
import { toastConfig } from "./components/ui/ToastConfig";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
