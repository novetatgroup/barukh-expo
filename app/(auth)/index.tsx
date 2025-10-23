import { useState } from "react";
import { StyleSheet, View } from "react-native";
import LoginScreen from "./login";
import RegisterScreen from "./register";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <View style={styles.container}>
      {activeTab === "login" ? (
        <LoginScreen 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ) : (
        <RegisterScreen 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});