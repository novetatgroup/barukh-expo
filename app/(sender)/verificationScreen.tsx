import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shipmentId?: string;
    orderId?: string;
    itemId?: string;
    itemName?: string;
    receiptUploaded?: string;
    trackingEntered?: string;
    pickupCodeShared?: string;
    deliveryCodeShared?: string;
    orderConfirmed?: string;
    verificationCompleted?: string;
  }>();
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6 digit traveller code to continue.");
      return;
    }

    router.push({
      pathname: "/(sender)/trackingDetails",
      params: {
        shipmentId: params.shipmentId || "",
        orderId: params.orderId || "#01-BK1624",
        itemId: params.itemId || "#BK1624",
        itemName: params.itemName || "MacBook Pro",
        receiptUploaded: params.receiptUploaded || "false",
        trackingEntered: params.trackingEntered || "false",
        pickupCodeShared: params.pickupCodeShared || "false",
        deliveryCodeShared: params.deliveryCodeShared || "false",
        orderConfirmed: params.orderConfirmed || "false",
        verificationCompleted: "true",
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={Theme.colors.primary} />
        </View>
        <Text style={styles.title}>Enter traveller code</Text>
        <Text style={styles.subtitle}>
          Ask the traveller for the 6 digit verification code before proof of delivery.
        </Text>

        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/[^0-9]/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={Theme.colors.text.lightGray}
          style={styles.input}
        />

        <CustomButton
          title="Verify Code"
          onPress={handleVerify}
          disabled={code.length !== 6}
          style={styles.verifyButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.lg,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.lg,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: 28,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
    letterSpacing: 10,
  },
  verifyButton: {
    marginTop: Theme.spacing.xl,
  },
});

export default VerificationScreen;
