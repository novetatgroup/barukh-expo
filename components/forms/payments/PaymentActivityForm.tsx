import { Theme } from "@/constants/Theme";
import { usePaymentActivity } from "@/hooks/usePaymentActivity";
import { PaymentStatus } from "@/types/payment";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = ReturnType<typeof usePaymentActivity>;
type Tab = "activity" | "cards";

const statusColor = (status: PaymentStatus) => {
  if (status === "CAPTURED") return Theme.colors.success;
  if (status === "FAILED") return Theme.colors.error;
  if (status === "REFUNDED" || status === "PENDING") return Theme.colors.orange;
  return Theme.colors.text.gray;
};

const PaymentActivityForm = ({
  mode,
  history,
  cards,
  loading,
  openDetails,
  resume,
  back,
}: Props) => {
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

      {mode === "mock" ? (
        <View style={styles.mockBadge}>
          <Ionicons name="flask-outline" size={15} color={Theme.colors.primary} />
          <Text style={styles.mockBadgeText}>Development fixtures</Text>
        </View>
      ) : (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Payment history and saved-card listing are disabled until their API contracts are supplied.
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />
      ) : tab === "activity" ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.reference}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No payment activity available.</Text>}
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
                {item.status === "PENDING" ? (
                  <TouchableOpacity
                    onPress={(event) => {
                      event.stopPropagation();
                      resume(item);
                    }}
                    style={styles.resumeButton}
                  >
                    <Text style={styles.resumeText}>Resume pending</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.amount}>USD {(item.amountMinor / 100).toFixed(2)}</Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Add card is disabled until secure Flutterwave v4 collection is approved.
              </Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No saved cards available.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="card-outline" size={22} color={Theme.colors.primary} />
              </View>
              <View style={styles.mainText}>
                <Text style={styles.cardTitle}>{item.brand} ending {item.last4}</Text>
                <Text style={styles.cardMeta}>Expires {item.expiryMonth}/{item.expiryYear}</Text>
              </View>
              {item.isDefault ? <Text style={styles.defaultText}>Default</Text> : null}
            </View>
          )}
        />
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
  mockBadge: { alignSelf: "flex-start", flexDirection: "row", gap: Theme.spacing.sm, backgroundColor: Theme.colors.yellow, borderRadius: Theme.borderRadius.xl, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, marginHorizontal: Theme.screenPadding.horizontal, marginTop: Theme.spacing.md },
  mockBadgeText: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  notice: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginHorizontal: Theme.screenPadding.horizontal, marginTop: Theme.spacing.md },
  noticeText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  loader: { marginTop: Theme.spacing.xl },
  list: { padding: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.xxxxxl, gap: Theme.spacing.sm },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, minHeight: 82 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background.border, marginRight: Theme.spacing.sm },
  mainText: { flex: 1 },
  cardTitle: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  cardMeta: { fontSize: 11, lineHeight: 17, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, marginTop: 2 },
  rightColumn: { alignItems: "flex-end", marginLeft: Theme.spacing.sm },
  amount: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  status: { fontSize: 10, fontFamily: "Inter-Bold", marginTop: Theme.spacing.xs },
  resumeButton: { alignSelf: "flex-start", paddingTop: Theme.spacing.sm, paddingRight: Theme.spacing.md },
  resumeText: { fontSize: 11, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  defaultText: { fontSize: 11, fontFamily: "Inter-SemiBold", color: Theme.colors.primary, backgroundColor: Theme.colors.yellow, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.borderRadius.xl },
  emptyText: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, textAlign: "center", marginTop: Theme.spacing.xl },
});

export default PaymentActivityForm;
