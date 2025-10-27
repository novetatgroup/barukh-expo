import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import RegisterForm from "../components/forms/auth/RegisterForm";
import OtpResponse from "../Interfaces/auth";

interface RegisterScreenProps {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}

const RegisterScreen = ({ activeTab, onTabChange }: RegisterScreenProps) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleRegister = async ({ name, email }: { name: string; email: string }) => {
    console.log("Register pressed:", name, email);

    try {
      const response = await fetch(`${apiUrl}/users/register/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const contentType = response.headers.get("content-type");
      let data: OtpResponse | string;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        console.log("API response success");

        const otpData = data as OtpResponse;

        if (otpData.sessionId) {
          await AsyncStorage.setItem("sessionId", otpData.sessionId);
          await AsyncStorage.setItem("otpFlow", "register");
          await AsyncStorage.setItem("attemptsLeft", otpData.attemptsLeft.toString());
          await AsyncStorage.setItem("expiresAt", otpData.expiresAt);
          console.log("Session data saved");
        }

        Toast.hide();
      
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: 'OTP Sent!',
            text2: `Verification code has been sent to the email`,
            position: 'top',
            visibilityTime: 4000,
          });
          
          console.log("Success toast displayed");
        
          setTimeout(() => {
            router.push("/(auth)/verifyOtpScreen");
          }, 2500);
          
        }, 300);

      } else {
        console.log("API error:", data);

        let errorMessage = typeof data === "string" ? data : data?.message || "Please try again";

        if (errorMessage === "User already exists") {
          console.log("Custom log: Email already exists");
        }

        Toast.hide();
        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Failed to Send OTP',
            text2: typeof data === "string" ? data : data.message || 'Please try again',
            position: 'top',
            visibilityTime: 4000,
          });
        }, 300);
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
          visibilityTime: 4000,
        });
      }, 300);
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