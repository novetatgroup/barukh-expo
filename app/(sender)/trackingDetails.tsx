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

type Step = {
  key:
    | "receiptUploaded"
    | "trackingEntered"
    | "sharePickUpCode"
    | "shareDeliveryCode"
    | "orderConfirmed"
    | "verificationCompleted"
    | "deliveryStatus"
    | "inTransit"
    | "completed";
  title: string;
  route?:
    | "/(sender)/uploadReceipt"
    | "/(sender)/enterTrackingNumber"
    | "/(sender)/sharePickupCode"
    | "/(sender)/shareDeliveryCode"
    | "/(sender)/confirmOrder"
    | "/(sender)/verificationScreen";
  completed: boolean;
};

const getSenderSteps = (status?: string): Step[] => {
  const pickedUp = hasReachedShipmentStage(status, "PICKED_UP");
  const inTransit = hasReachedShipmentStage(status, "IN_TRANSIT");
  const delivered = hasReachedShipmentStage(status, "DELIVERED");

  return [
    {
      key: "sharePickUpCode",
      title: "Share Pick Up Code",
      route: "/(sender)/sharePickupCode",
      completed: pickedUp,
    },
    {
      key: "inTransit",
      title: "In Transit",
      completed: inTransit,
    },
    {
      key: "shareDeliveryCode",
      title: "Share Delivery Code",
      route: "/(sender)/shareDeliveryCode",
      completed: delivered,
    },
    {
      key: "deliveryStatus",
      title: "Delivery Status",
      completed: delivered,
    },
    {
      key: "completed",
      title: "Completed",
      completed: delivered,
    },
  ];
};

const TrackingDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    id?: string;
    shipmentId?: string;
    orderId?: string;
    itemId?: string;
    itemName?: string;
    receiptUploaded?: string;
    trackingEntered?: string;
    pickupCodeShared?: string;
    deliveryCodeShared?: string;
    orderConfirmed?: string;
    verificationCompleted?: string;
    status?: string;
    progress?: string;
  }>();

  const shipmentId = params.shipmentId || params.id || "";
  const status = shipment?.status || params.status || params.progress || "PENDING";
  const itemId = shipment?.packageId
    ? `#${shipment.packageId.slice(0, 8).toUpperCase()}`
    : params.itemId || "#BK1624";
  const itemName = shipment?.package?.name || params.itemName || "MacBook Pro";
  const checklistSteps = useMemo(() => getSenderSteps(status), [status]);

  const baseParams = {
    shipmentId,
    orderId: params.orderId || "#01-BK1624",
    itemId,
    itemName,
    status,
    progress: formatShipmentStatus(status),
    pickupCodeShared: String(hasReachedShipmentStage(status, "PICKED_UP")),
    deliveryCodeShared: String(hasReachedShipmentStage(status, "DELIVERED")),
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

  const handleStepPress = (step: Step) => {
    if (!step.route || step.completed) return;
    router.push({
      pathname: step.route,
      params: baseParams,
    });
  };

  const handleGoToShipmentDetails = () => {
    router.replace({
      pathname: "/(sender)/shipmentDetails",
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
            <View>
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
            {checklistSteps.map((step, index) => (
              <TouchableOpacity
                key={step.key}
                activeOpacity={step.route && !step.completed ? 0.75 : 1}
                style={styles.timelineRow}
                onPress={() => handleStepPress(step)}
                disabled={!step.route || step.completed}
              >
                <View style={styles.markerColumn}>
                  <View style={[styles.marker, step.completed && styles.completedMarker]}>
                    <Ionicons name="checkmark" size={14} color={Theme.colors.white} />
                  </View>
                  {index < checklistSteps.length - 1 ? (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed && styles.completedLine,
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.timelineText}>
                  <Text style={styles.stepLabel}>STEP {index + 1}</Text>
                  <Text style={styles.checklistTitle}>{step.title}</Text>
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
    paddingBottom: Theme.spacing.xl,
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
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.md,
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
    minHeight: 66,
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
  completedLine: {
    borderColor: Theme.colors.green,
  },
  timelineText: {
    flex: 1,
    paddingLeft: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  stepLabel: {
    fontSize: 9,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
    marginBottom: 2,
  },
  stepDate: {
    fontSize: 8,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
    marginBottom: 1,
  },
  checklistTitle: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  completedTitle: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  closeButton: {
    height: 50,
    borderRadius: 25,
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

export default TrackingDetailsScreen;
