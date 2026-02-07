import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import LoginForm from "../components/forms/auth/LoginForm";
import { authService } from "../services/authService";

interface LoginScreenProps {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}

const LoginScreen = ({ activeTab, onTabChange }: LoginScreenProps) => {
  const handleLogin = async ({ email }: { email: string }) => {
    const { data, error, ok } = await authService.requestLoginOtp(email);

    if (ok && data?.sessionId) {
      await AsyncStorage.setItem("sessionId", data.sessionId);
      await AsyncStorage.setItem("otpFlow", "login");
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("attemptsLeft", data.attemptsLeft.toString());
      await AsyncStorage.setItem("expiresAt", data.expiresAt);

      Toast.success("OTP sent to your email!");
      setTimeout(() => router.push("/(auth)/verifyOtpScreen"), 2000);
    } else {
      Toast.error(error || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm
        onSubmit={handleLogin}
        onGooglePress={() => console.log("Google pressed")}
        onRegisterPress={() => onTabChange("register")}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LoginScreen;
