import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import VerifyOtpForm from "../components/forms/auth/VerifyOtpForm";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/authService";

const VerifyOtpScreen = () => {
	const { setAuthState } = useContext(AuthContext);

	const handleVerifyOtp = async ({ otp }: { otp: string }) => {
		const sessionId = await AsyncStorage.getItem("sessionId");
		if (!sessionId) {
			Toast.error("Please try again.");
			return;
		}

		const { data, error, ok } = await authService.verifyOtp({
			otpCode: otp,
			sessionId,
		});

		if (ok && data?.accessToken) {
			const decoded = jwtDecode<{ userId: string | number }>(data.accessToken);

			const userId =
				typeof decoded.userId === "string" || typeof decoded.userId === "number"
					? String(decoded.userId)
					: null;

			if (!userId) {
				Toast.error("Invalid user ID received. Please contact support.");
				return;
			}

			await setAuthState({
				refreshToken: data.refreshToken,
				accessToken: data.accessToken,
				isAuthenticated: true,
				userId: userId,
			});

			Toast.success("OTP verified successfully!");
			setTimeout(() => router.push("/roleSelection"), 1500);
			return;
		}

		Toast.error(error || "Verification failed. Please try again.");
	};

	const handleResendOtp = async () => {
		const otpFlow = await AsyncStorage.getItem("otpFlow");
		const email = await AsyncStorage.getItem("email");
		if (!otpFlow || !email) {
			Toast.error("Missing email or flow. Please try again.");
			return;
		}

		const flow = otpFlow as "login" | "register";
		const { data, error, ok } = await authService.resendOtp(flow, email);

		if (ok && data?.sessionId) {
			await AsyncStorage.setItem("sessionId", data.sessionId);
			Toast.success("A new OTP has been sent to your email.");
		} else {
			Toast.error(error || "Failed to resend OTP. Try again.");
		}
	};

	return (
		<View style={styles.container}>
			<VerifyOtpForm
				onSubmit={handleVerifyOtp}
				onResend={handleResendOtp}
				length={6}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default VerifyOtpScreen;
