import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ShipmentRole = "sender" | "traveller";

type ShipmentDetailsFormProps = {
  role?: ShipmentRole;
  orderId: string;
  itemId: string;
  itemName: string;
  progress: string;
  expectedDelivery?: string;
  shipmentCost?: string;
  insuranceFee?: string;
  serviceFee?: string;
  onBack: () => void;
};

const navItems = [
  { route: "/(tabs)/home", active: "home", inactive: "home-outline" },
  {
    route: "/(tabs)/shipments",
    active: "briefcase",
    inactive: "briefcase-outline",
  },
  { route: "/(tabs)/chat", active: "chatbubbles", inactive: "chatbubbles-outline" },
  { route: "/(tabs)/profile", active: "person", inactive: "person-outline" },
] as const;

const getStatusColors = (progress: string) => {
  switch (progress) {
    case "Delivered":
      return {
        badge: styles.deliveredBadge,
        text: styles.lightBadgeText,
      };
    case "Rejected":
    case "Cancelled":
      return {
        badge: styles.cancelledBadge,
        text: styles.lightBadgeText,
      };
    default:
      return {
        badge: styles.inTransitBadge,
        text: styles.lightBadgeText,
      };
  }
};

const ShipmentDetailsForm: React.FC<ShipmentDetailsFormProps> = ({
  role = "sender",
  orderId,
  itemId,
  itemName,
  progress,
  expectedDelivery = "Jul 30",
  shipmentCost = "$10.00",
  insuranceFee = "$3.20",
  serviceFee = "$1.50",
  onBack,
}) => {
  const statusColors = getStatusColors(progress);
  const statusSteps = [
    { date: "21 July 2025", label: "Receipt Uploaded" },
    {
      date: "21 July 2025",
      label: role === "traveller" ? "Package Accepted" : "Accepted by Traveller",
    },
    { date: "27 July 2025", label: "Package in Transit" },
    { date: "29 July 2025", label: "Package Delivered" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order ID {orderId}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Theme.colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderCard}>
          <View style={styles.packageRow}>
            <View style={styles.packageIcon}>
              <Ionicons
                name="cube-outline"
                size={21}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.packageText}>
              <Text style={styles.itemId}>{itemId}</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>

            <View style={[styles.statusBadge, statusColors.badge]}>
              <Text style={[styles.statusText, statusColors.text]}>
                {progress}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Order Status</Text>

          <View style={styles.timeline}>
            {statusSteps.map((step, index) => (
              <View key={step.label} style={styles.timelineRow}>
                <View style={styles.markerColumn}>
                  <View style={styles.checkMarker}>
                    <Ionicons name="checkmark" size={13} color={Theme.colors.white} />
                  </View>
                  {index < statusSteps.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineText}>
                  <Text style={styles.timelineDate}>{step.date}</Text>
                  <Text style={styles.timelineLabel}>{step.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.deliveryPill}>
          <Text style={styles.deliveryText}>
            Expected delivery on {expectedDelivery}
          </Text>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Info</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Shipment cost</Text>
            <Text style={styles.paymentValue}>{shipmentCost}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Insurance</Text>
            <Text style={styles.paymentValue}>{insuranceFee}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service fee</Text>
            <Text style={styles.paymentValue}>{serviceFee}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = item.route === "/(tabs)/shipments";
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.navItem}
                onPress={() => router.push(item.route)}
              >
                <Ionicons
                  name={isActive ? item.active : item.inactive}
                  size={24}
                  color={
                    isActive ? Theme.colors.primary : Theme.colors.text.gray
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 132,
  },
  orderCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  packageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  packageText: {
    flex: 1,
  },
  itemId: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  deliveredBadge: {
    backgroundColor: Theme.colors.green,
  },
  inTransitBadge: {
    backgroundColor: Theme.colors.lightPurple,
  },
  cancelledBadge: {
    backgroundColor: Theme.colors.text.gray,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  lightBadgeText: {
    color: Theme.colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.md,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 57,
  },
  markerColumn: {
    width: 28,
    alignItems: "center",
  },
  checkMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.colors.green,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    minHeight: 38,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
    marginTop: 3,
  },
  timelineText: {
    flex: 1,
    paddingLeft: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  timelineDate: {
    fontSize: 9,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
    marginBottom: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  deliveryPill: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  deliveryText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  paymentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    padding: Theme.spacing.md,
  },
  paymentTitle: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.md,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  bottomNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    backgroundColor: "rgba(244, 241, 242, 0.92)",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  navItem: {
    padding: Theme.spacing.sm,
  },
});

export default ShipmentDetailsForm;
