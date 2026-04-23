import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SenderShipmentDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = (params.orderId as string) || "#01-BK1624";
  const itemId = (params.itemId as string) || "#BK1624";
  const itemName = (params.itemName as string) || "MacBook Pro";
  const progress = (params.progress as string) || "In Transit";
  const shipperName = (params.shipperName as string) || "James Lutalo";
  const recipientName = (params.recipientName as string) || "Sanyu Twine";
  const fromLocation = (params.fromLocation as string) || "Ontario, Canada";
  const toLocation = (params.toLocation as string) || "Kampala, Uganda";

  const handleTrackOrder = () => {
    router.push({
      pathname: "/(sender)/trackingDetails",
      params: {
        orderId,
        itemId,
        itemName,
        receiptUploaded: "false",
        trackingEntered: "false",
        orderConfirmed: "false",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment Details</Text>
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
        <View style={styles.card}>
          <View style={styles.packageRow}>
            <View style={styles.packageIcon}>
              <Ionicons
                name="cube-outline"
                size={22}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.packageText}>
              <Text style={styles.itemId}>{itemId}</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{progress}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Shipper Name :</Text>
              <Text style={styles.detailValue}>{shipperName}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Recipient Name :</Text>
              <Text style={styles.detailValue}>{recipientName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>From :</Text>
              <Text style={styles.detailValue}>{fromLocation}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>To :</Text>
              <Text style={styles.detailValue}>{toLocation}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.trackButton}
            onPress={handleTrackOrder}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 96,
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
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: Theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  packageIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  packageText: {
    flex: 1,
  },
  itemId: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    backgroundColor: Theme.colors.lightPurple,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.white,
  },
  detailRow: {
    flexDirection: "row",
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginVertical: Theme.spacing.md,
  },
  trackButton: {
    height: 45,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.xl,
  },
  trackButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default SenderShipmentDetailsScreen;
