import Theme from "@/app/constants/Theme";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../../ui/CustomButton";
import { OtpInput } from "react-native-otp-entry";

type VerifyPhoneOtpFormProps = {
  onSubmit: (data: { otp: string }) => void;
  length: number;
};

const VerifyPhoneOtpForm: React.FC<VerifyPhoneOtpFormProps> = ({ onSubmit, length }) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(120);
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
    // TODO: Re-enable when OTP API is integrated
    // if (otp.length !== length) return;

    try {
      setLoading(true);
      await onSubmit({ otp });
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown === 0) {
      setCountdown(120);
      setOtp("");
    }
  };

  const isOtpComplete = otp.length === length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Verify</Text>
          <Text style={styles.subHeading}>Your Code</Text>
        </View>

        <Text style={styles.subtitle}>
          We've sent a 6-digit code to your phone number
        </Text>

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
          <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
            <Text
              style={[
                styles.resendText,
                countdown > 0
                  ? styles.resendTextDisabled
                  : styles.resendTextEnabled,
              ]}
            >
              Send code again {countdown > 0 && formatTime(countdown)}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Verify"
          variant="primary"
          onPress={handleSubmit}
          style={styles.button}
          // TODO: Re-enable when OTP API is integrated
          // disabled={!isOtpComplete}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f2",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
  },
  headerContainer: {
    marginBottom: Theme.spacing.lg,
  },
  heading: {
    fontSize: 34,
    color: Theme.colors.primary,
    fontWeight: "400",
  },
  subHeading: {
    fontSize: 36,
    fontWeight: "bold",
    color: Theme.colors.primary,
  },
  subtitle: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    marginBottom: 32,
  },
  otpContainer: {
    marginBottom: Theme.spacing.xl,
  },
  otpInnerContainer: {
    gap: 8,
  },
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
  resendContainer: {
    marginBottom: Theme.spacing.xxl,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
  resendTextDisabled: {
    color: "#666",
  },
  resendTextEnabled: {
    color: Theme.colors.primary,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  button: {
    width: "100%",
  },
});

export default VerifyPhoneOtpForm;
