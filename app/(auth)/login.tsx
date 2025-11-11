import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import LoginForm from "../components/forms/auth/LoginForm";
import OtpResponse from "../Interfaces/auth";

interface LoginScreenProps {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}

const LoginScreen = ({ activeTab, onTabChange }: LoginScreenProps) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async ({ email }: { email: string }) => {
    console.log("Login pressed:", email);

    try {
      const response = await fetch(`${apiUrl}/auth/login/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
        console.log("API response data:", data);
      } catch {
        data = { message: "Unexpected server response" };
      }

      if (response.ok) {
        console.log("API response success");

        const otpData = data as OtpResponse;

        if (otpData.sessionId) {
          await AsyncStorage.setItem("sessionId", otpData.sessionId);
          await AsyncStorage.setItem("otpFlow", "login");
          await AsyncStorage.setItem(
            "attemptsLeft",
            otpData.attemptsLeft.toString()
          );
          await AsyncStorage.setItem("expiresAt", otpData.expiresAt);
          console.log("Session data saved");
        }

        Toast.success("OTP sent to your email!");

        setTimeout(() => {
          router.push("/(auth)/verifyOtpScreen");
        }, 2000);
      } else {
        console.log("API error:", data);

        Toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);

      Toast.error("Please check your connection.");
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
