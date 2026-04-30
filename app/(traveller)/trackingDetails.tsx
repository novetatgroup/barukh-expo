import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService, ShipmentDetails } from "@/services/senderService";
import {
  formatShipmentStatus,
  hasReachedShipmentStage,
} from "@/utils/shipmentTracking";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TravellerStep = {
  key:
    | "confirmPickUpCompleted"
    | "tripStarted"
    | "deliveryPhotoUploaded"
    | "confirmDeliveryCompleted"
    | "completed";
  title: string;
  route?:
    | "/(traveller)/confirmPickUp"
    | "/(traveller)/startTrip"
    | "/(traveller)/verificationScreen"
    | "/(traveller)/deliveryUpload"
    | "/(traveller)/confirmDelivery";
  completed: boolean;
};

const getTravellerSteps = (status?: string): TravellerStep[] => {
  const pickedUp = hasReachedShipmentStage(status, "PICKED_UP");
  const inTransit = hasReachedShipmentStage(status, "IN_TRANSIT");
  const delivered = hasReachedShipmentStage(status, "DELIVERED");

  return [
    {
      key: "confirmPickUpCompleted",
      title: "Confirm Pick Up (Code)",
      route: "/(traveller)/confirmPickUp",
      completed: pickedUp,
    },
    {
      key: "tripStarted",
      title: "Start Trip",
      route: "/(traveller)/startTrip",
      completed: inTransit,
    },
    {
      key: "deliveryPhotoUploaded",
      title: "Upload Delivery Photo",
      route: "/(traveller)/deliveryUpload",
      completed: delivered,
    },
    {
      key: "confirmDeliveryCompleted",
      title: "Confirm Delivery (Code)",
      route: "/(traveller)/confirmDelivery",
      completed: delivered,
    },
    {
      key: "completed",
      title: "Completed",
      completed: delivered,
    },
  ];
};

const TravellerTrackingDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    id?: string;
    shipmentId?: string;
    itemId?: string;
    itemName?: string;
    status?: string;
    progress?: string;
    deliveryPhotoKey?: string;
  }>();

  const shipmentId = params.shipmentId || params.id || "";
  const status = shipment?.status || params.status || params.progress || "PENDING";
  const itemId = shipment?.packageId
    ? `#${shipment.packageId.slice(0, 8).toUpperCase()}`
    : params.itemId || "#BK1624";
  const itemName = shipment?.package?.name || params.itemName || "MacBook Pro";
  const travellerSteps = useMemo(() => getTravellerSteps(status), [status]);

  const baseParams = {
    shipmentId,
    itemId,
    itemName,
    status,
    progress: formatShipmentStatus(status),
    confirmPickUpCompleted: String(hasReachedShipmentStage(status, "PICKED_UP")),
    tripStarted: String(hasReachedShipmentStage(status, "IN_TRANSIT")),
    deliveryPhotoUploaded: String(hasReachedShipmentStage(status, "DELIVERED")),
    confirmDeliveryCompleted: String(hasReachedShipmentStage(status, "DELIVERED")),
    deliveryPhotoKey: params.deliveryPhotoKey || "",
  };

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

  const handleStepPress = (step: TravellerStep) => {
    if (!step.route || step.completed) {
      return;
    }

    router.push({
      pathname: step.key === "confirmDeliveryCompleted"
        ? "/(traveller)/verificationScreen"
        : step.route,
      params: baseParams,
    });
  };

  const handleGoToShipmentDetails = () => {
    router.replace({
      pathname: "/(traveller)/shipmentDetails",
      params: {
        id: shipmentId,
        ...baseParams,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoToShipmentDetails} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Details</Text>
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
          </View>

          <Text style={styles.sectionTitle}>Order Status</Text>
          {isRefreshing && !shipment ? (
            <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />
          ) : null}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.timeline}>
            {travellerSteps.map((step, index) => (
              <TouchableOpacity
                key={step.key}
                activeOpacity={step.route && !step.completed ? 0.75 : 1}
                style={styles.timelineRow}
                onPress={() => handleStepPress(step)}
                disabled={!step.route || step.completed}
              >
                <View style={styles.markerColumn}>
                  <View
                    style={[
                      styles.marker,
                      step.completed && styles.completedMarker,
                    ]}
                  >
                    <Ionicons name="checkmark" size={14} color={Theme.colors.white} />
                  </View>
                  {index < travellerSteps.length - 1 ? (
                    <View style={styles.timelineLine} />
                  ) : null}
                </View>

                <View style={styles.timelineText}>
                  <Text style={styles.stepLabel}>STEP {index + 1}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.closeButton}
          onPress={handleGoToShipmentDetails}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
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
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.lg,
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
  timeline: {
    paddingLeft: 2,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 72,
  },
  markerColumn: {
    width: 28,
    alignItems: "center",
  },
  marker: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#C9C9C9",
    alignItems: "center",
    justifyContent: "center",
  },
  completedMarker: {
    backgroundColor: Theme.colors.green,
  },
  timelineLine: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#6B7280",
    marginTop: 4,
  },
  timelineText: {
    flex: 1,
    paddingLeft: Theme.spacing.sm,
    paddingBottom: Theme.spacing.lg,
  },
  stepLabel: {
    fontSize: 9,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  closeButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.xl,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default TravellerTrackingDetailsScreen;
