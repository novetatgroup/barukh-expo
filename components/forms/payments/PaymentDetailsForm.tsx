import SampleDataBanner from "@/components/ui/SampleDataBanner";
import { Theme } from "@/constants/Theme";
import { usePaymentDetails } from "@/hooks/usePaymentDetails";
import { PaymentHistoryItem } from "@/types/payment";
import { formatMoney } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = ReturnType<typeof usePaymentDetails>;

const SAMPLE_ITEM: PaymentHistoryItem = {
  reference: "sample-captured",
  shipmentId: "sample-shipment-1",
  amountMinor: 4860,
  currency: "USD",
  status: "CAPTURED",
  createdAt: "2026-07-29T09:30:00.000Z",
  maskedMethod: {
    id: "sample-card-1",
    brand: "VISA",
    last4: "4242",
    expiryMonth: "09",
    expiryYear: "29",
    cardholderName: "Sample User",
    isDefault: true,
  },
  description: "Documents to Kampala",
};

const PaymentDetailsForm = ({ back }: Props) => {
  const item = SAMPLE_ITEM;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction details</Text>
        <View style={styles.headerButton} />
      </View>
      <SampleDataBanner />
      <View style={styles.card}>
        <Text style={styles.title}>{item.description}</Text>
        {[
          ["Status", item.status],
          ["Amount", formatMoney(item.amountMinor, item.currency)],
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
      </View>
    </View>
  );
};

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
});

export default PaymentDetailsForm;
