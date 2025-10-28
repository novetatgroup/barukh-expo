import Theme from "@/app/constants/Theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "../../ui/CustomButton";
import AuthScreenLayout from "./AuthScreenLayout";
import { OtpInput } from "react-native-otp-entry";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

type VerifyOtpFormProps = {
	onSubmit: (data: { otp: string }) => Promise<void>;
	length: number;
};

const VerifyOtpForm: React.FC<VerifyOtpFormProps> = ({ onSubmit, length }) => {
	const [otp, setOtp] = useState("");
	const [countdown, setCountdown] = useState(60);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleOtpChange = (text: string) => {
		setOtp(text);
	};

	const handleSubmit = async () => {
		if (otp.length !== length) {
			Toast.show({
				type: "error",
				text1: "Incomplete code",
				text2: "Please enter all digits",
			});
			return;
		}
		try {
			setLoading(true);
			await onSubmit({ otp });
		} finally {
			setLoading(false);
		}
	};

	const handleResendCode = async () => {
		if (countdown === 0) {
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
				const apiUrl = process.env.EXPO_PUBLIC_API_URL;
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
					setCountdown(50);
					setOtp("");
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
			} catch {
				Toast.show({
					type: "error",
					text1: "Network Error",
					text2: "Could not resend code. Try again later.",
					position: "top",
					visibilityTime: 3000,
				});
			}
		}
	};

	const isOtpComplete = otp.length === length;

	return (
		<AuthScreenLayout
			title="Verify Your Code"
			subtitle="We've sent a 6-digit code to your email">
			<View style={styles.content}>
				<View style={styles.otpContainer}>
					<OtpInput
						numberOfDigits={length}
						onTextChange={handleOtpChange}
						focusColor={Theme.colors.primary}
						theme={{
							containerStyle: styles.otpInnerContainer,
							pinCodeContainerStyle: styles.otpInput,
							pinCodeTextStyle: styles.otpText,
							focusStickStyle: {
								backgroundColor: Theme.colors.primary,
							},
							focusedPinCodeContainerStyle: {
								borderColor: Theme.colors.primary,
								borderWidth: 2,
							},
						}}
					/>
				</View>

				<View style={styles.resendContainer}>
					<TouchableOpacity
						onPress={handleResendCode}
						disabled={countdown > 0}>
						<Text
							style={[
								styles.resendText,
								countdown > 0
									? styles.resendTextDisabled
									: styles.resendTextEnabled,
							]}>
							Send code again{" "}
							{countdown > 0 && formatTime(countdown)}
						</Text>
					</TouchableOpacity>
				</View>

				<CustomButton
					title="Verify"
					variant="primary"
					onPress={handleSubmit}
					style={styles.button}
					disabled={!isOtpComplete}
					loading={loading}
				/>
			</View>
		</AuthScreenLayout>
	);
};

const styles = StyleSheet.create({
	content: { alignItems: "center", paddingTop: Theme.spacing.xxl },
	otpContainer: { marginBottom: Theme.spacing.xl, width: "100%" },
	otpInnerContainer: { gap: 8 },
	otpInput: {
		width: 50,
		height: 50,
		borderRadius: Theme.borderRadius.xl,
		backgroundColor: "#f5f5f5",
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	otpText: {
		fontSize: 20,
		fontWeight: "600",
		fontFamily: "Inter-SemiBold",
		color: Theme.colors.text.dark,
	},
	resendContainer: { marginBottom: Theme.spacing.xxl },
	resendText: {
		fontSize: 14,
		fontFamily: "Inter-Regular",
		textAlign: "center",
	},
	resendTextDisabled: { color: "#666" },
	resendTextEnabled: {
		color: Theme.colors.primary,
		fontWeight: "600",
		fontFamily: "Inter-SemiBold",
	},
	button: { width: "100%", marginTop: Theme.spacing.lg },
});

export default VerifyOtpForm;
