import { Theme } from "@/constants/Theme";
import { usePaymentReturn } from "@/hooks/usePaymentReturn";
import { PaymentStatus } from "@/types/payment";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = ReturnType<typeof usePaymentReturn>;

const statusIcon = (status: PaymentStatus | null) => {
  switch (status) {
    case "CAPTURED":
      return { name: "checkmark-circle" as const, color: Theme.colors.success };
    case "FAILED":
      return { name: "close-circle" as const, color: Theme.colors.error };
    case "CANCELLED":
      return { name: "remove-circle" as const, color: Theme.colors.text.gray };
    case "REFUNDED":
      return { name: "return-down-back" as const, color: Theme.colors.orange };
    case "PENDING":
    default:
      return { name: "time" as const, color: Theme.colors.orange };
  }
};

const PaymentReturnForm = ({ mode, loading, message, paymentStatus, continueToPayment }: Props) => {
  const presentation = statusIcon(paymentStatus);

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.card}>
        {mode === "mock" ? (
          <View style={styles.mockBadge}>
            <Ionicons name="flask-outline" size={15} color={Theme.colors.primary} />
            <Text style={styles.mockBadgeText}>Development mock</Text>
          </View>
        ) : null}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <Ionicons name={presentation.name} size={50} color={presentation.color} />
        )}
        <Text style={styles.title}>Payment return</Text>
        <Text style={styles.message}>{message}</Text>
        {!loading ? (
          <TouchableOpacity style={styles.button} onPress={continueToPayment}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.secondary,
  },
  card: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xl,
  },
  mockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.yellow,
    marginBottom: Theme.spacing.md,
  },
  mockBadgeText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  title: {
    fontSize: 19,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginTop: Theme.spacing.md,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginTop: Theme.spacing.sm,
  },
  button: {
    width: "100%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.primary,
    marginTop: Theme.spacing.lg,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default PaymentReturnForm;
