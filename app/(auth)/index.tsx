import { useState } from "react";
import { View } from "react-native";
import RegisterScreen from "./register";
import LoginScreen from "./login";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <View style={{ flex: 1 }}>
      {activeTab === "login" ? (
        <LoginScreen />
      ) : (
        <RegisterScreen />
      )}
    </View>
  );
}
