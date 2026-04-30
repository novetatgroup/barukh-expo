import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService, ShipmentDetails } from "@/services/senderService";
import {
  formatShipmentStatus,
  getShipmentDeliveryPhotoUrl,
} from "@/utils/shipmentTracking";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SenderShipmentDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    id?:string;
    shipmentId?: string;
    orderId?: string;
    itemId?: string;
    itemName?: string;
    progress?: string;
    shipperName?: string;
    recipientName?: string;
    fromLocation?: string;
    toLocation?: string;
  }>();
  const shipmentId = params.shipmentId || params.id || "";
  const id = shipmentId;
  const orderId = (params.orderId as string) || "#01-BK1624";
  const itemId = shipment?.packageId
    ? `#${shipment.packageId.slice(0, 8).toUpperCase()}`
    : (params.itemId as string) || "#BK1624";
  const itemName = shipment?.package?.name || (params.itemName as string) || "MacBook Pro";
  const progress = formatShipmentStatus(shipment?.status || params.progress || "PENDING");
  const shipperName = (params.shipperName as string) || "James Lutalo";
  const recipientName = (params.recipientName as string) || "Sanyu Twine";
  const fromLocation =
    shipment?.package?.originCity ||
    shipment?.travel?.originCity ||
    (params.fromLocation as string) ||
    "Ontario, Canada";
  const toLocation =
    shipment?.package?.destinationCity ||
    shipment?.travel?.destinationCity ||
    (params.toLocation as string) ||
    "Kampala, Uganda";
  const deliveryPhotoUrl = getShipmentDeliveryPhotoUrl(shipment);

  const fetchShipment = useCallback(async () => {
    if (!shipmentId || !accessToken) return;

    setIsRefreshing(true);
    setErrorMessage(null);
    const result = await senderService.getShipment(shipmentId, accessToken);
    setIsRefreshing(false);

    if (!result.ok || !result.data) {
      setErrorMessage(result.error || "Unable to load shipment.");
      return;
    }

    setShipment(result.data);
  }, [accessToken, shipmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchShipment();
    }, [fetchShipment])
  );

  const handleTrackOrder = () => {
    router.push({
      pathname: "/(sender)/trackingDetails",
      params: {
        id,
        shipmentId,
        orderId,
        itemId,
        itemName,
        status: shipment?.status || params.progress || "PENDING",
        progress,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/shipments")}
          style={styles.headerButton}
        >
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
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchShipment} />
        }
      >
        <View style={styles.card}>
          {isRefreshing && !shipment ? (
            <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />
          ) : null}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
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

          {deliveryPhotoUrl ? (
            <>
              <View style={styles.divider} />
              <View style={styles.deliveryPhotoSection}>
                <Text style={styles.sectionTitle}>Delivery Photo</Text>
                <Image
                  source={{ uri: deliveryPhotoUrl }}
                  style={styles.deliveryPhoto}
                  resizeMode="cover"
                />
              </View>
            </>
          ) : null}

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
    backgroundColor: Theme.colors.background.secondary,
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
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loader: {
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.error,
    marginBottom: Theme.spacing.md,
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
    color: Theme.colors.text.gray,
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
  deliveryPhotoSection: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  deliveryPhoto: {
    width: "100%",
    height: 190,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background.secondary,
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
