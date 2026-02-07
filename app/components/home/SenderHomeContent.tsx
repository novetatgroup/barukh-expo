import Theme from "@/app/constants/Theme";
import { PackagePattern } from "@/assets/svgs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Shipment = {
  id: string;
  item: string;
  trackingNumber: string;
  status: string;
  progress: "Pending" | "In Transit" | "Delivered";
};

const shipments: Shipment[] = [
  {
    id: "1",
    trackingNumber: "#BK1098",
    item: "JBL Flip 6",
    status: "Shipments",
    progress: "Pending",
  },
  {
    id: "2",
    trackingNumber: "#BK1098",
    item: "MacBook Pro",
    status: "Shipments",
    progress: "In Transit",
  },
  {
    id: "3",
    trackingNumber: "#BK1098",
    item: "JBL Flip 6",
    status: "Shipments",
    progress: "Delivered",
  },
  {
    id: "4",
    trackingNumber: "#BK1098",
    item: "JBL Flip 6",
    status: "Shipments",
    progress: "Delivered",
  },
];

const SenderHomeContent = () => {
  const router = useRouter();
  const userName = "Sanyu";

  const getStatusStyle = (progress: string) => {
    switch (progress) {
      case "Pending":
        return { badge: styles.pending, text: styles.pendingText };
      case "In Transit":
        return { badge: styles.inTransit, text: styles.inTransitText };
      case "Delivered":
        return { badge: styles.delivered, text: styles.deliveredText };
      default:
        return { badge: styles.pending, text: styles.pendingText };
    }
  };

  const handleNavigateToShipments = (tab?: string) => {
    router.push({
      pathname: "/(tabs)/shipments",
      params: { tab: tab || "All" },
    });
  };

  const handleSendPackage = () => {
    router.push("/(sender)/createShipment");
  };

  return (
    <View style={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.patternOverlay}>
          <PackagePattern />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.userRow}>
            <Image
              source={require("@/assets/images/avatar.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>Welcome Back !</Text>
              <Text style={styles.userName}>Hi {userName}</Text>
            </View>
            <TouchableOpacity style={styles.bellIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Theme.colors.white}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.myShipmentsTitle}>My Shipments</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search shipments"
              placeholderTextColor="#FFFFFF80"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.sendPackageButton]}
          onPress={handleSendPackage}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add" size={24} />
          </View>
          <Text style={styles.actionButtonText}>Send Package</Text>
        </TouchableOpacity>
      </View>

      {/* Shipments Section */}
      <View style={styles.shipmentHeader}>
        <Text style={styles.shipmentTitle}>My Shipments</Text>
        <TouchableOpacity onPress={() => handleNavigateToShipments("All")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {shipments.length > 0 ? (
        <FlatList
          data={shipments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.progress);
            return (
              <View style={styles.shipmentCard}>
                <View style={styles.packageIconContainer}>
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color={Theme.colors.primary}
                  />
                </View>
                <View style={styles.shipmentInfo}>
                  <Text style={styles.trackingNumber}>
                    {item.trackingNumber}
                  </Text>
                  <Text style={styles.shipmentItem}>{item.item}</Text>
                </View>
                <View style={[styles.statusBadge, statusStyle.badge]}>
                  <Text style={[styles.statusText, statusStyle.text]}>
                    {item.progress}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <Text style={styles.emptyText}>No shipments yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xxxxl,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    overflow: "hidden",
    position: "relative",
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    right: -20,
    width: 220,
    height: 260,
  },
  headerContent: {
    zIndex: 1,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Theme.spacing.md,
    backgroundColor: Theme.colors.secondary,
  },
  bellIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    padding: Theme.spacing.sm,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  welcomeText: {
    color: "#CED1D8",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  userName: {
    color: Theme.colors.white,
    fontSize: 21,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    letterSpacing: -1,
  },
  myShipmentsTitle: {
    color: Theme.colors.white,
    fontSize: 30,
    fontFamily: "Inter-Bold",
    lineHeight: 36,
    letterSpacing: -2,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#282828",
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.white,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  qrButton: {
    padding: Theme.spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
  },
  sendPackageButton: {
    backgroundColor: "#C7F530",
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.sm,
  },
  actionButtonText: {
    color: "#163330",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  shipmentTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  seeAll: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  listContent: {
    paddingBottom: 100,
  },
  shipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageIconContainer: {
    backgroundColor: "#C7F530",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  shipmentInfo: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.black,
    marginBottom: 2,
  },
  shipmentItem: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  pending: {
    backgroundColor: "#9CA3AF",
  },
  inTransit: {
    backgroundColor: "#7856D3",
  },
  delivered: {
    backgroundColor: "#32BF5B",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  pendingText: {
    color: Theme.colors.white,
  },
  inTransitText: {
    color: Theme.colors.white,
  },
  deliveredText: {
    color: Theme.colors.white,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.xl,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default SenderHomeContent;
