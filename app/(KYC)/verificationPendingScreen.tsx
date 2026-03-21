import AuthContext from "@/context/AuthContext";
import Theme from "@/constants/Theme";
import { kycService } from "@/services/kycService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import CustomButton from "@/components/ui/CustomButton";
import { StyleSheet, Text, View } from "react-native";

const POLL_INTERVAL_MS = 10_000;
const REDIRECT_DELAY_S = 5;

export default function VerificationPendingScreen() {
  const { accessToken, userId } = useContext(AuthContext);
  const [isVerified, setIsVerified] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_S);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkJobStatus = async () => {
    if (!userId || !accessToken) return;

    const { data } = await kycService.getJobStatus(userId, accessToken);
    console.log("[KYC] Job status response:", JSON.stringify(data, null, 2));

    if (!data || data.status === "PROCESSING") return; // still processing, keep polling

    clearInterval(intervalRef.current!);

    if (data.status === "PASSED") {
      setIsVerified(true);
      let remaining = REDIRECT_DELAY_S;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
          router.replace("/(tabs)/home");
        }
      }, 1000);
    } else {
      setIsFailed(true);
    }
  };

  useEffect(() => {
    checkJobStatus();
    intervalRef.current = setInterval(checkJobStatus, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [userId]);

  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={36} color={Theme.colors.yellow} />
          </View>
          <Text style={styles.title}>
            {"Account\n"}
            <Text style={styles.titleBold}>Verified</Text>
            {"\n"}
            <Text style={styles.titleNormal}>Successfully</Text>
          </Text>
          <Text style={styles.body}>
            You will be redirected to the home page in {countdown} second{countdown !== 1 ? "s" : ""}.
          </Text>
        </View>
      </View>
    );
  }

  if (isFailed) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.failedCircle}>
            <Ionicons name="close" size={36} color={Theme.colors.white} />
          </View>
          <Text style={styles.title}>
            {"Verification\n"}
            <Text style={styles.titleBold}>Failed</Text>
          </Text>
          <Text style={styles.body}>
            We were unable to verify your identity. Please try again.
          </Text>
          <CustomButton
            title="Retry"
            variant="primary"
            onPress={() => router.replace("/(KYC)/KYCLanding")}
            style={styles.button}
          />
          <CustomButton
            title="Go to Home"
            variant="secondary"
            onPress={() => router.replace("/(tabs)/home")}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pendingCircle}>
          <Ionicons name="time-outline" size={48} color={Theme.colors.primary} />
        </View>
        <Text style={styles.title}>
          Verification{"\n"}
          <Text style={styles.titleBold}>In Progress</Text>
        </Text>
        <Text style={styles.body}>
          We're verifying your identity. This may take a few minutes. You'll be notified once it's done.
        </Text>
        <CustomButton
          title="Go to Home"
          variant="primary"
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f2",
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.screenPadding.horizontal,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  failedCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: Theme.colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  pendingCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 40,
    textAlign: "center",
  },
  titleBold: {
    fontWeight: "700",
  },
  titleNormal: {
    fontWeight: "400",
  },
  body: {
    ...Theme.typography.body,
    fontSize: 15,
    color: Theme.colors.text.gray,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  button: {
    width: "100%",
    marginTop: Theme.spacing.lg,
  },
});
