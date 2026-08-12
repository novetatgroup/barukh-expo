import SampleDataBanner from "@/components/ui/SampleDataBanner";
import { Theme } from "@/constants/Theme";
import { usePaymentActivity } from "@/hooks/usePaymentActivity";
import { PaymentHistoryItem, PaymentStatus } from "@/types/payment";
import { formatMoney } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = ReturnType<typeof usePaymentActivity>;
type Tab = "activity" | "cards";

const SAMPLE_HISTORY: PaymentHistoryItem[] = [
  {
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
  },
  {
    reference: "sample-refunded",
    shipmentId: "sample-shipment-2",
    amountMinor: 3275,
    currency: "USD",
    status: "REFUNDED",
    createdAt: "2026-07-20T14:15:00.000Z",
    maskedMethod: {
      id: "sample-card-2",
      brand: "MASTERCARD",
      last4: "4444",
      expiryMonth: "04",
      expiryYear: "30",
      cardholderName: "Sample User",
      isDefault: false,
    },
    description: "Camera lens to Entebbe",
  },
];

const statusColor = (status: PaymentStatus) => {
  if (status === "CAPTURED") return Theme.colors.success;
  if (status === "FAILED") return Theme.colors.error;
  if (status === "REFUNDED" || status === "PENDING") return Theme.colors.orange;
  return Theme.colors.text.gray;
};

const PaymentActivityForm = ({ openDetails, back }: Props) => {
  const [tab, setTab] = useState<Tab>("activity");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.tabs}>
        {(["activity", "cards"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tab, tab === item && styles.activeTab]}
            onPress={() => setTab(item)}
          >
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>
              {item === "activity" ? "Activity" : "Saved cards"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bannerWrap}>
        <SampleDataBanner />
      </View>

      {tab === "activity" ? (
        <FlatList
          data={SAMPLE_HISTORY}
          keyExtractor={(item) => item.reference}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openDetails(item)}>
              <View style={styles.iconCircle}>
                <Ionicons name="receipt-outline" size={22} color={Theme.colors.primary} />
              </View>
              <View style={styles.mainText}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.cardMeta}>
                  {new Date(item.createdAt).toLocaleDateString()} - {item.maskedMethod.brand} {item.maskedMethod.last4}
                </Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.amount}>{formatMoney(item.amountMinor, item.currency)}</Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.list}>
          <Text style={styles.emptyText}>
            Manage your saved card from the checkout screen.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.secondary },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Theme.spacing.xxxxxl, paddingHorizontal: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.md },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  tabs: { flexDirection: "row", gap: Theme.spacing.sm, paddingHorizontal: Theme.screenPadding.horizontal },
  tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: Theme.borderRadius.xl, backgroundColor: Theme.colors.background.border },
  activeTab: { backgroundColor: Theme.colors.yellow },
  tabText: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  activeTabText: { fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  bannerWrap: { paddingHorizontal: Theme.screenPadding.horizontal, paddingTop: Theme.spacing.md },
  list: { padding: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.xxxxxl, gap: Theme.spacing.sm },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, minHeight: 82 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background.border, marginRight: Theme.spacing.sm },
  mainText: { flex: 1 },
  cardTitle: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  cardMeta: { fontSize: 11, lineHeight: 17, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, marginTop: 2 },
  rightColumn: { alignItems: "flex-end", marginLeft: Theme.spacing.sm },
  amount: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  status: { fontSize: 10, fontFamily: "Inter-Bold", marginTop: Theme.spacing.xs },
  emptyText: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, textAlign: "center", marginTop: Theme.spacing.xl },
});

export default PaymentActivityForm;
