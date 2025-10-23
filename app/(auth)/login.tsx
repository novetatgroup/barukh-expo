import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: "Unexpected server response" };
      }

      if (response.ok) {
        console.log("API response success");

        const otpData = data as OtpResponse;

        if (otpData.sessionId) {
          await AsyncStorage.setItem("sessionId", otpData.sessionId);
          await AsyncStorage.setItem("otpFlow", "login");
          await AsyncStorage.setItem("attemptsLeft", otpData.attemptsLeft.toString());
          await AsyncStorage.setItem("expiresAt", otpData.expiresAt);
          console.log("Session data saved");
        }

        Toast.show({
          type: 'success',
          text1: 'OTP Sent!',
          text2: 'Verification code has been sent to your email',
          position: 'top',
          visibilityTime: 1000,
          autoHide: true,
        });

        setTimeout(() => {
          Toast.hide();
          router.push("/(auth)/verifyOtpScreen");
        }, 2000);

      } else {
        console.log("API error:", data);

        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Failed to Send OTP',
            text2: data?.message || 'Please try again',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
          });
        }, 100);
      }
    } catch (error) {
      console.error('Network error:', error);

      Toast.hide();

      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Please check your connection',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
      }, 100);
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