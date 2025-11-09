import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import VerifyOtpForm from "../components/forms/auth/VerifyOtpForm";
import { AuthContext } from "../context/AuthContext";

const VerifyOtpScreen = () => {
  const { setAuthState } = useContext(AuthContext);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleVerifyOtp = async ({ otp }: { otp: string }) => {
    try {
      const sessionId = await AsyncStorage.getItem("sessionId");

      if (!sessionId) {
        Toast.error("Please try again.");
        return;
      }

      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-platform": "barukh_mobile",
        },
        body: JSON.stringify({ otpCode: otp, sessionId }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        const decoded = jwtDecode<{ userId: string | number }>(
          data.accessToken
        );

        await setAuthState({
          refreshToken: data.refreshToken,
          accessToken: data.accessToken,
          isAuthenticated: true,
          userId: decoded.userId ? Number(decoded.userId) : null,
        });

        Toast.success("OTP verified successfully!");

        setTimeout(() => {
          router.push("/roleSelection");
        }, 1500);

        return;
      }

      const errorMessage =
        data?.message ||
        data?.error ||
        "Verification failed. Please try again.";

      Toast.error("Verification failed. Please try again.");
    } catch (error) {
      console.error("API error:", error);
      Toast.error("Network error. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <VerifyOtpForm onSubmit={handleVerifyOtp} length={6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VerifyOtpScreen;
