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

type Step = {
  key: "receiptUploaded" | "trackingEntered" | "orderConfirmed" | "deliveryStatus";
  title: string;
  route?: "/(sender)/uploadReceipt" | "/(sender)/enterTrackingNumber" | "/(sender)/confirmOrder";
};

const checklistSteps: Step[] = [
  { key: "receiptUploaded", title: "Upload Receipt", route: "/(sender)/uploadReceipt" },
  { key: "trackingEntered", title: "Enter Tracking Number", route: "/(sender)/enterTrackingNumber" },
  { key: "orderConfirmed", title: "Confirm Order", route: "/(sender)/confirmOrder" },
  { key: "deliveryStatus", title: "Delivery Status" },
];

const completedSteps = [
  { date: "Mon, 21 July 2025", title: "Receipt Uploaded" },
  { date: "Mon, 21 July 2025", title: "Package Expected by Traveler" },
  { date: "Thur, 27 July 2025", title: "Traveler has item" },
  { date: "Sat, 29 July 2025", title: "Package in Transit" },
  { date: "Sat, 29 July 2025", title: "Package Delivered" },
];

const isComplete = (value?: string) => value === "true";

const TrackingDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    itemId?: string;
    itemName?: string;
    receiptUploaded?: string;
    trackingEntered?: string;
    orderConfirmed?: string;
  }>();

  const itemId = params.itemId || "#BK1624";
  const itemName = params.itemName || "MacBook Pro";
  const receiptUploaded = isComplete(params.receiptUploaded);
  const trackingEntered = isComplete(params.trackingEntered);
  const orderConfirmed = isComplete(params.orderConfirmed);
  const allComplete = receiptUploaded && trackingEntered && orderConfirmed;

  const completionByKey: Record<Step["key"], boolean> = {
    receiptUploaded,
    trackingEntered,
    orderConfirmed,
    deliveryStatus: allComplete,
  };

  const baseParams = {
    orderId: params.orderId || "#01-BK1624",
    itemId,
    itemName,
    receiptUploaded: String(receiptUploaded),
    trackingEntered: String(trackingEntered),
    orderConfirmed: String(orderConfirmed),
  };

  const handleStepPress = (step: Step) => {
    if (!step.route) return;
    router.replace({
      pathname: step.route,
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
            <View>
              <Text style={styles.itemId}>{itemId}</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Order Status</Text>

          {allComplete ? (
            <View style={styles.timeline}>
              {completedSteps.map((step, index) => (
                <View key={step.title} style={styles.timelineRow}>
                  <View style={styles.markerColumn}>
                    <View style={[styles.marker, styles.completedMarker]}>
                      <Ionicons name="checkmark" size={14} color={Theme.colors.white} />
                    </View>
                    {index < completedSteps.length - 1 ? (
                      <View style={[styles.timelineLine, styles.completedLine]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineText}>
                    <Text style={styles.stepDate}>{step.date}</Text>
                    <Text style={styles.completedTitle}>{step.title}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.timeline}>
              {checklistSteps.map((step, index) => {
                const checked = completionByKey[step.key];
                return (
                  <TouchableOpacity
                    key={step.key}
                    activeOpacity={step.route ? 0.75 : 1}
                    style={styles.timelineRow}
                    onPress={() => handleStepPress(step)}
                    disabled={!step.route}
                  >
                    <View style={styles.markerColumn}>
                      <View style={[styles.marker, checked && styles.completedMarker]}>
                        <Ionicons name="checkmark" size={14} color={Theme.colors.white} />
                      </View>
                      {index < checklistSteps.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                    <View style={styles.timelineText}>
                      <Text style={styles.stepLabel}>STEP {index + 1}</Text>
                      <Text style={styles.checklistTitle}>{step.title}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
