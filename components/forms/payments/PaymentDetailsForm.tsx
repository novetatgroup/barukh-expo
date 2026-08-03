import { Theme } from "@/constants/Theme";
import { usePaymentDetails } from "@/hooks/usePaymentDetails";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = ReturnType<typeof usePaymentDetails>;

const PaymentDetailsForm = ({ item, loading, back }: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={back} style={styles.headerButton}>
        <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transaction details</Text>
      <View style={styles.headerButton} />
    </View>
    {loading ? (
      <ActivityIndicator color={Theme.colors.primary} />
    ) : item ? (
      <View style={styles.card}>
        <Text style={styles.title}>{item.description}</Text>
        {[
          ["Status", item.status],
          ["Amount", `USD ${(item.amountMinor / 100).toFixed(2)}`],
          ["Shipment", item.shipmentId],
          ["Method", `${item.maskedMethod.brand} ending ${item.maskedMethod.last4}`],
          ["Date", new Date(item.createdAt).toLocaleString()],
          ["Reference", item.reference],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={2}>{value}</Text>
          </View>
        ))}
        <Text style={styles.mockText}>Development fixture - not a real transaction</Text>
      </View>
    ) : (
      <Text style={styles.empty}>Transaction details are unavailable.</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.secondary, paddingHorizontal: Theme.screenPadding.horizontal },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Theme.spacing.xxxxxl, paddingBottom: Theme.spacing.lg },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  card: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg },
  title: { fontSize: 17, fontFamily: "Inter-Bold", color: Theme.colors.text.dark, marginBottom: Theme.spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", gap: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.background.border },
  label: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  value: { flex: 1, fontSize: 13, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark, textAlign: "right" },
  mockText: { fontSize: 11, fontFamily: "Inter-Regular", color: Theme.colors.primary, backgroundColor: Theme.colors.yellow, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.sm, marginTop: Theme.spacing.md, textAlign: "center" },
  empty: { fontSize: 14, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, textAlign: "center", marginTop: Theme.spacing.xl },
});

export default PaymentDetailsForm;
