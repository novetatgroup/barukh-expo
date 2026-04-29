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

type TravellerStep = {
  key:
    // | "packageUploaded"
    | "confirmPickUpCompleted"
    | "tripStarted"
    | "verificationCompleted"
    | "deliveryPhotoUploaded"
    | "confirmDeliveryCompleted";
  title: string;
  route:
    // | "/(traveller)/packageUpload"
    | "/(traveller)/confirmPickUp"
    | "/(traveller)/startTrip"
    | "/(traveller)/verificationScreen"
    | "/(traveller)/deliveryUpload"
    | "/(traveller)/confirmDelivery";
};

const travellerSteps: TravellerStep[] = [
  // {
  //   key: "packageUploaded",
  //   title: "Upload Package",
  //   route: "/(traveller)/packageUpload",
  // },
  {
    key: "confirmPickUpCompleted",
    title: "Confirm Pick Up (Code)",
    route: "/(traveller)/confirmPickUp",
  },
  {
    key: "tripStarted",
    title: "Start Trip",
    route: "/(traveller)/startTrip",
  },
  // {
  //   key: "verificationCompleted",
  //   title: "Verify Sender Code",
  //   route: "/(traveller)/verificationScreen",
  // },
  // verificationScreen
  {
    key: "deliveryPhotoUploaded",
    title: "Upload Delivery Photo",
    route: "/(traveller)/deliveryUpload",
  },

  {
    key: "confirmDeliveryCompleted",
    title: "Confirm Delivery (Code)",
    route: "/(traveller)/confirmDelivery",
  },
];

const isComplete = (value?: string) => value === "true";

const TravellerTrackingDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shipmentId?: string;
    itemId?: string;
    itemName?: string;
    progress?: string;
    packageUploaded?: string;
    confirmPickUpCompleted?: string;
    tripStarted?: string;
    verificationCompleted?: string;
    deliveryPhotoUploaded?: string;
    confirmDeliveryCompleted?: string;
    deliveryPhotoKey?: string;
  }>();

  const itemId = params.itemId || "#BK1624";
  const itemName = params.itemName || "MacBook Pro";

  const completionByKey: Record<TravellerStep["key"], boolean> = {
    // packageUploaded: isComplete(params.packageUploaded),
    confirmPickUpCompleted: isComplete(params.confirmPickUpCompleted),
    tripStarted: isComplete(params.tripStarted),
    verificationCompleted: isComplete(params.verificationCompleted),
    deliveryPhotoUploaded: isComplete(params.deliveryPhotoUploaded),
    confirmDeliveryCompleted: isComplete(params.confirmDeliveryCompleted),
  };

  const baseParams = {
    shipmentId: params.shipmentId || "",
    itemId,
    itemName,
    progress: params.progress || "In Transit",
    // packageUploaded: String(completionByKey.packageUploaded),
    confirmPickUpCompleted: String(completionByKey.confirmPickUpCompleted),
    tripStarted: String(completionByKey.tripStarted),
    verificationCompleted: String(completionByKey.verificationCompleted),
    deliveryPhotoUploaded: String(completionByKey.deliveryPhotoUploaded),
    confirmDeliveryCompleted: String(completionByKey.confirmDeliveryCompleted),
    deliveryPhotoKey: params.deliveryPhotoKey || "",
  };

  const handleStepPress = (step: TravellerStep) => {
    console.log({step});
    let pathname = step.route;

    if (step.key === "deliveryPhotoUploaded" && !completionByKey.deliveryPhotoUploaded) {
      pathname = "/(traveller)/deliveryUpload";
    }

    if (step.key === "confirmDeliveryCompleted" && !completionByKey.confirmDeliveryCompleted) {
      pathname = "/(traveller)/verificationScreen";
    }

    router.push({
      pathname,
      params: baseParams,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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

          <View style={styles.timeline}>
            {travellerSteps.map((step, index) => (
              <TouchableOpacity
                key={step.key}
                activeOpacity={0.75}
                style={styles.timelineRow}
                onPress={() => handleStepPress(step)}
              >
                <View style={styles.markerColumn}>
                  <View
                    style={[
                      styles.marker,
                      completionByKey[step.key] && styles.completedMarker,
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
          onPress={() => router.back()}
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
