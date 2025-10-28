import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import VerifyOtpForm from "../components/forms/auth/VerifyOtpForm";
import { AuthContext } from "../context/AuthContext";

const VerifyOtpScreen = () => {
	const { setAuthState } = useContext(AuthContext);
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	useEffect(() => {
		Toast.hide();
	}, []);

	const handleVerifyOtp = async ({ otp }: { otp: string }) => {
		try {
			const sessionId = await AsyncStorage.getItem("sessionId");
			const otpFlow = await AsyncStorage.getItem("otpFlow");
			const email = await AsyncStorage.getItem("email");

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
				headers: {
					"Content-Type": "application/json",
					"x-client-platform": "barukh_mobile",
				},
				body: JSON.stringify({ sessionId, otpCode: otp }),
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

			Toast.show({
				type: "error",
				text1: "Verification Failed",
				text2:
					data?.message ||
					data?.error ||
					"Verification failed. Please try again.",
				position: "top",
				visibilityTime: 3000,
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "Network error",
				text2: "Please try again later.",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	return (
		<View style={styles.container}>
			<VerifyOtpForm onSubmit={handleVerifyOtp} length={6} />
		</View>
	);
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default VerifyOtpScreen;
