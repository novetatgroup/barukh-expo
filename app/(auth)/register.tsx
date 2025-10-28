import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import RegisterForm from "../components/forms/auth/RegisterForm";
import OtpResponse from "../Interfaces/auth";

WebBrowser.maybeCompleteAuthSession();

interface RegisterScreenProps {
	activeTab: "login" | "register";
	onTabChange: (tab: "login" | "register") => void;
}

const RegisterScreen = ({ activeTab, onTabChange }: RegisterScreenProps) => {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const handleRegister = async ({
		name,
		email,
	}: {
		name: string;
		email: string;
	}) => {
		console.log("Register pressed:", name, email);

		try {
			const response = await fetch(
				`${apiUrl}/users/register/request-otp`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-client-platform": "barukh_mobile",
					},
					body: JSON.stringify({ name, email }),
				}
			);

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
					await AsyncStorage.setItem("otpFlow", "register");
					await AsyncStorage.setItem(
						"attemptsLeft",
						otpData.attemptsLeft.toString()
					);
					await AsyncStorage.setItem("expiresAt", otpData.expiresAt);
				}

				Toast.hide();
				setTimeout(() => {
					Toast.show({
						type: "success",
						text1: "OTP Sent!",
						text2: "Verification code has been sent to the email",
						position: "top",
						visibilityTime: 4000,
					});
					setTimeout(
						() => router.push("/(auth)/verifyOtpScreen"),
						2500
					);
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
						visibilityTime: 4000,
					});
				}, 300);
			}
		} catch (error) {
			console.error("Network error:", error);
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

	const handleGoogleOauth = async () => {
		try {
			Toast.show({
				type: "info",
				text1: "Redirecting to Google...",
				position: "top",
				visibilityTime: 3000,
			});

			const response = await fetch(`${apiUrl}/auth/consentScreen`);
			if (!response.ok)
				throw new Error("Failed to get consent screen URL");

			const data = await response.json();
			const consentUrl = data.url;

			const redirectUri = AuthSession.makeRedirectUri({
				scheme: "barukhexpo",
			});

			const result = await WebBrowser.openAuthSessionAsync(
				consentUrl,
				redirectUri
			);

			if (result.type === "success") {
				const url = result.url;
				const urlObj = new URL(url);
				const accessToken = urlObj.searchParams.get("accessToken");

				if (accessToken) {
					Toast.show({
						type: "success",
						text1: "Google Login Successful",
						text2: "Redirecting...",
						position: "top",
						visibilityTime: 2000,
					});
					router.push("/roleSelection");
				}
			} else {
				Toast.show({
					type: "error",
					text1: "Google Login Cancelled",
					position: "top",
					visibilityTime: 2000,
				});
			}
		} catch (error) {
			console.error("Google OAuth Error:", error);
			Toast.show({
				type: "error",
				text1: "Google Login Failed",
				text2: "Please try again later.",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	return (
		<View style={styles.container}>
			<RegisterForm
				onSubmit={handleRegister}
				onGooglePress={handleGoogleOauth}
				onLoginPress={() => onTabChange("login")}
				activeTab={activeTab}
				onTabChange={onTabChange}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default RegisterScreen;
