import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import VerifyOtpForm from "../components/forms/auth/VerifyOtpForm";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const VerifyOtpScreen = () => {
	const { setAuthState } = useContext(AuthContext);
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const handleVerifyOtp = async ({ otp }: { otp: string }) => {
		try {
			const sessionId = await AsyncStorage.getItem("sessionId");
			const otpFlow = await AsyncStorage.getItem("otpFlow");

			if (!sessionId || !otpFlow) {
				Toast.show({
					type: "error",
					text1: "Please try again.",
					position: "top",
					visibilityTime: 2500,
				});
				return;
			}

			const endpoint =
				otpFlow === "register"
					? `${apiUrl}/users/register/verify-otp`
					: `${apiUrl}/auth/login/verify-otp`;

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otpCode: otp, sessionId }),
				credentials: "include",
			});

			const data = await response.json();

			if (response.ok && data.accessToken) {
				const decoded = jwtDecode<{ userId: string | number }>(
					data.accessToken
				);

				await setAuthState({
					accessToken: data.accessToken,
					isAuthenticated: true,
					userId: decoded.userId ? Number(decoded.userId) : null,
				});

				await AsyncStorage.removeItem("otpFlow");

				Toast.show({
					type: "success",
					text1: "OTP verified successfully!",
					position: "top",
					visibilityTime: 2000,
				});

				setTimeout(() => {
					router.push("/roleSelection");
				}, 1500);

				return;
			}

			const errorMessage =
				data?.message ||
				data?.error ||
				"Verification failed. Please try again.";

			Toast.show({
				type: "error",
				text1: "Verification Failed",
				text2: errorMessage,
				position: "top",
				visibilityTime: 3000,
			});
		} catch (error) {
			console.error("API error:", error);
			Toast.show({
				type: "error",
				text1: "Network error",
				text2: "Please try again later.",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const handleResendOtp = async () => {
		try {
			const otpFlow = await AsyncStorage.getItem("otpFlow");
			const email = await AsyncStorage.getItem("email");

			if (!otpFlow || !email) {
				Toast.show({
					type: "error",
					text1: "Missing data",
					text2: "Please go back and try again.",
					position: "top",
					visibilityTime: 2500,
				});
				return;
			}

			const endpoint =
				otpFlow === "register"
					? `${apiUrl}/users/register/request-otp`
					: `${apiUrl}/auth/login/request-otp`;

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok && data.sessionId) {
				await AsyncStorage.setItem("sessionId", data.sessionId);
				Toast.show({
					type: "success",
					text1: "New OTP Sent!",
					position: "top",
					visibilityTime: 2000,
				});
			} else {
				Toast.show({
					type: "error",
					text1: "Failed to resend code",
					text2: data?.message || "Please try again",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Resend OTP error:", error);
			Toast.show({
				type: "error",
				text1: "Network Error",
				text2: "Could not resend code. Try again later.",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	return (
		<View style={styles.container}>
			<VerifyOtpForm
				onSubmit={handleVerifyOtp}
				onResend={handleResendOtp}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
});

export default VerifyOtpScreen;
