import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import LoginForm from "../components/forms/auth/LoginForm";
import OtpResponse from "../Interfaces/auth";

const LoginScreen = () => {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const handleLogin = async ({ email }: { email: string }) => {
		try {
			Toast.show({
				type: "info",
				text1: "Sending OTP...",
				text2: "Please wait",
				position: "top",
				visibilityTime: 2000,
				autoHide: true,
			});

			const response = await fetch(`${apiUrl}/auth/login/request-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const contentType = response.headers.get("content-type");
			let data: OtpResponse | string;

			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			if (response.ok) {
				const otpData = data as OtpResponse;

				if (otpData.sessionId) {
					await AsyncStorage.setItem("sessionId", otpData.sessionId);
					await AsyncStorage.setItem("otpFlow", "login");
					await AsyncStorage.setItem(
						"attemptsLeft",
						otpData.attemptsLeft.toString()
					);
					await AsyncStorage.setItem("expiresAt", otpData.expiresAt);
					await AsyncStorage.setItem("email", email);
				}

				Toast.hide();
				setTimeout(() => {
					Toast.show({
						type: "success",
						text1: "OTP Sent!",
						text2: "Verification code has been sent to the email",
						position: "top",
						visibilityTime: 2500,
						autoHide: true,
					});
					setTimeout(() => {
						router.push("/(auth)/verifyOtpScreen");
					}, 1800);
				}, 300);
			} else {
				Toast.hide();
				setTimeout(() => {
					Toast.show({
						type: "error",
						text1: "Failed to Send OTP",
						text2:
							typeof data === "string"
								? data
								: data.message || "Please try again",
						position: "top",
						visibilityTime: 3000,
					});
				}, 300);
			}
		} catch (error) {
			Toast.hide();
			setTimeout(() => {
				Toast.show({
					type: "error",
					text1: "Network Error",
					text2: "Please check your connection",
					position: "top",
					visibilityTime: 4000,
				});
			}, 300);
		}
	};

	return (
		<View style={styles.container}>
			<LoginForm
				onSubmit={handleLogin}
				onGooglePress={() => {}}
				onLoginPress={() => {}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0b3d2e",
	},
});

export default LoginScreen;
