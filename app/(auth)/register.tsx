import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import RegisterForm from "../components/forms/auth/RegisterForm";
import { authService } from "../services/authService";

interface RegisterScreenProps {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}

const RegisterScreen = ({ activeTab, onTabChange }: RegisterScreenProps) => {
  const handleRegister = async ({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) => {
    const { data, error, ok } = await authService.requestRegisterOtp({
      email,
      name,
    });

    if (ok && data?.sessionId) {
      await AsyncStorage.setItem("sessionId", data.sessionId);
      await AsyncStorage.setItem("otpFlow", "register");
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("attemptsLeft", data.attemptsLeft.toString());
      await AsyncStorage.setItem("expiresAt", data.expiresAt);

      Toast.success("OTP sent to your email!");
      setTimeout(() => router.push("/(auth)/verifyOtpScreen"), 2500);
    } else {
      Toast.error(error || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <RegisterForm
        onSubmit={handleRegister}
        onGooglePress={() => console.log("Google pressed")}
        onLoginPress={() => onTabChange("login")}
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

export default RegisterScreen;
