import Theme from "@/app/constants/Theme";
import React, { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
} from "react-native";
import CustomButton from "../../ui/CustomButton";
import AuthScreenLayout from "./AuthScreenLayout";

type VerifyOtpFormProps = {
	onSubmit: (data: { otp: string }) => void;
	onResend?: () => void;
};

const { width: screenWidth } = Dimensions.get("window");

const VerifyOtpForm: React.FC<VerifyOtpFormProps> = ({
	onSubmit,
	onResend,
}) => {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [countdown, setCountdown] = useState(60);
	const [loading, setLoading] = useState(false);
	const inputRefs = useRef<(TextInput | null)[]>([]);

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

	const handleOtpChange = (text: string, index: number) => {
		const newOtp = [...otp];
		if (text.length > 0) {
			newOtp[index] = text.slice(-1);
			setOtp(newOtp);
			if (index < 5 && text.length > 0) {
				inputRefs.current[index + 1]?.focus();
			}
		} else {
			newOtp[index] = "";
			setOtp(newOtp);
		}
	};

	const handleKeyPress = (event: any, index: number) => {
		if (
			event.nativeEvent.key === "Backspace" &&
			otp[index] === "" &&
			index > 0
		) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleSubmit = async () => {
		const otpString = otp.join("");

		if (otpString.length !== 6) return;

		try {
			setLoading(true);
			await onSubmit({ otp: otpString });
		} catch (error) {
			console.error("Error verifying OTP:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleResendCode = () => {
		if (countdown === 0 && onResend) {
			setCountdown(60);
			onResend();
		}
	};

	const isOtpComplete = otp.every((digit) => digit !== "");

	return (
		<AuthScreenLayout
			title="Verify Your Code"
			subtitle="We've sent a 6-digit code to your email">
			<View style={styles.content}>
				<View style={styles.otpContainer}>
					{otp.map((digit, index) => (
						<TextInput
							key={index}
							ref={(ref) => {
								inputRefs.current[index] = ref;
							}}
							style={[
								styles.otpInput,
								digit
									? styles.otpInputFilled
									: styles.otpInputEmpty,
							]}
							value={digit}
							onChangeText={(text) =>
								handleOtpChange(text, index)
							}
							onKeyPress={(event) => handleKeyPress(event, index)}
							keyboardType="number-pad"
							maxLength={1}
							selectTextOnFocus
							textAlign="center"
							autoFocus={index === 0}
						/>
					))}
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
	container: {
		flex: 1,
		backgroundColor: Theme.colors.primary,
	},
	logo: {
		width: 45,
		height: 45,
		marginLeft: Theme.screenPadding.horizontal,
		marginTop: Theme.spacing.xxxxxxxl,
	},
	grid: {
		width: 350,
		height: 350,
		position: "absolute",
		top: 0,
		left: screenWidth - 240 - 10,
	},
	title: {
		...Theme.typography.h1,
		textAlign: "left",
		marginLeft: Theme.screenPadding.horizontal,
		color: Theme.colors.text.light,
	},
	subtitle: {
		...Theme.typography.caption,
		marginLeft: Theme.screenPadding.horizontal,
		textAlign: "left",
		marginTop: -10,
		marginBottom: Theme.spacing.xl,
		color: Theme.colors.text.light,
	},
	formContainer: {
		backgroundColor: Theme.colors.white,
		borderTopLeftRadius: Theme.borderRadius.xl,
		borderTopRightRadius: Theme.borderRadius.xl,
		padding: Theme.screenPadding.horizontal,
		flex: 1,
		alignItems: "center",
		paddingTop: Theme.spacing.xxl,
	},
	otpContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: Theme.spacing.xl,
		paddingHorizontal: Theme.spacing.sm,
	},
	otpInput: {
		width: 50,
		height: 50,
		borderRadius: Theme.borderRadius.xl,
		backgroundColor: "#f5f5f5",
		fontSize: 20,
		fontWeight: "600",
		color: Theme.colors.text.dark,
		marginHorizontal: 8,
		textAlign: "center",
	},
	otpInputEmpty: {
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	otpInputFilled: {
		borderWidth: 2,
		borderColor: Theme.colors.primary,
		backgroundColor: "#fff",
	},
	resendContainer: {
		marginBottom: Theme.spacing.xxl,
	},
	resendText: {
		fontSize: 14,
		textAlign: "center",
	},
	resendTextDisabled: {
		color: "#666",
	},
	resendTextEnabled: {
		color: Theme.colors.primary,
		fontWeight: "600",
	},
	button: {
		width: "100%",
		marginTop: Theme.spacing.lg,
	},
	content: {
		width: "100%",
		alignItems: "center",
		paddingHorizontal: Theme.screenPadding.horizontal,
	},
});

export default VerifyOtpForm;
