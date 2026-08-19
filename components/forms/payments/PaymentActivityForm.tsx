import { Theme } from "@/constants/Theme";
import { usePaymentActivity } from "@/hooks/usePaymentActivity";
import { PaymentStatus, PaymentTransaction } from "@/types/payment";
import { formatMoney } from "@/utils/formatting";
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

const formatRoute = (sourceDestination: string) =>
  sourceDestination
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" → ");

const PaymentActivityForm = ({
  transactions,
  loading,
  refreshing,
  loadingMore,
  reload,
  loadMore,
  openDetails,
  cards,
  cardsLoading,
  addCard,
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
              {item === "activity" ? "Transactions" : "Saved cards"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "activity" ? (
        loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.reference}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={reload}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="receipt-outline" size={48} color={Theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Your payment activity will show up here once you complete a shipment payment.
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.footerLoader} />
              ) : null
            }
            renderItem={({ item }: { item: PaymentTransaction }) => (
              <TouchableOpacity style={styles.card} onPress={() => openDetails(item)}>
                <View style={styles.iconCircle}>
                  <Ionicons name="receipt-outline" size={22} color={Theme.colors.primary} />
                </View>
                <View style={styles.mainText}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {formatRoute(item.sourceDestination)}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.travellerName} · {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.rightColumn}>
                  <Text style={styles.amount}>{formatMoney(item.totalAmount, item.currency)}</Text>
                  <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : cardsLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.flwPaymentCardId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity style={styles.addCardButton} onPress={addCard}>
              <Ionicons name="add" size={20} color={Theme.colors.white} />
              <Text style={styles.addCardButtonText}>
                {cards.length === 0 ? "Add a card" : "Add another card"}
              </Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="card-outline" size={48} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No saved cards yet</Text>
              <Text style={styles.emptySubtext}>
                Add a card to make paying for your shipments faster.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="card-outline" size={22} color={Theme.colors.primary} />
              </View>
              <View style={styles.mainText}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.cardHolderName}</Text>
                <Text style={styles.cardMeta}>•••• {item.last4}</Text>
              </View>
              {item.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              ) : null}
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
  tabs: { flexDirection: "row", gap: Theme.spacing.sm, paddingHorizontal: Theme.screenPadding.horizontal, marginBottom: Theme.spacing.md },
  tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: Theme.borderRadius.xl, backgroundColor: Theme.colors.background.border },
  activeTab: { backgroundColor: Theme.colors.yellow },
  tabText: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  activeTabText: { fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  loader: { marginTop: Theme.spacing.xxxxl },
  addCardButton: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  addCardButtonText: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.white },
  footerLoader: { marginVertical: Theme.spacing.md },
  list: { padding: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.xxxxxl, gap: Theme.spacing.sm, flexGrow: 1 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, minHeight: 82 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background.border, marginRight: Theme.spacing.sm },
  mainText: { flex: 1 },
  cardTitle: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  cardMeta: { fontSize: 11, lineHeight: 17, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, marginTop: 2 },
  rightColumn: { alignItems: "flex-end", marginLeft: Theme.spacing.sm },
  amount: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  status: { fontSize: 10, fontFamily: "Inter-Bold", marginTop: Theme.spacing.xs },
  defaultBadge: { backgroundColor: Theme.colors.yellow, borderRadius: Theme.borderRadius.xl, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs },
  defaultBadgeText: { fontSize: 10, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  emptyState: { alignItems: "center", paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.xl },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EBF2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: Theme.colors.text.dark, marginBottom: Theme.spacing.sm },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
});

export default PaymentActivityForm;
