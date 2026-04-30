import React, { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/Theme";
import CustomButton from "@/components/ui/CustomButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { travellerService } from "@/services/travellerService";
import { AuthContext } from "@/context/AuthContext";

const StartTripScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useLocalSearchParams<{
    shipmentId?: string;
    itemId?: string;
    itemName?: string;
    progress?: string;
    packageUploaded?: string;
    confirmPickUpCompleted?: string;
    verificationCompleted?: string;
    deliveryPhotoUploaded?: string;
    confirmDeliveryCompleted?: string;
    deliveryPhotoKey?: string;
  }>();

  const handleStartTrip = async () => {
    if (!params.shipmentId) {
      Alert.alert("Missing shipment", "No shipment was provided for this trip.");
      return;
    }

    if (!accessToken) {
      Alert.alert("Authentication required", "Please sign in and try again.");
      return;
    }

    setIsSubmitting(true);
    const result = await travellerService.updateShipmentStatus(
      params.shipmentId,
      { status: "INTRANSIT" },
      accessToken
    );
    setIsSubmitting(false);

    if (!result.ok) {
      Alert.alert("Unable to start trip", result.error || "Please try again.");
      return;
    }

    router.push({
      pathname: "/(traveller)/trackingDetails",
      params: {
        shipmentId: params.shipmentId,
        itemId: params.itemId || "#BK1624",
        itemName: params.itemName || "MacBook Pro",
        progress: params.progress || "In Transit",
        packageUploaded: params.packageUploaded || "false",
        confirmPickUpCompleted: params.confirmPickUpCompleted || "false",
        tripStarted: "true",
        verificationCompleted: params.verificationCompleted || "false",
        deliveryPhotoUploaded: params.deliveryPhotoUploaded || "false",
        confirmDeliveryCompleted: params.confirmDeliveryCompleted || "false",
        deliveryPhotoKey: params.deliveryPhotoKey || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Trip</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="airplane" size={40} color={Theme.colors.white} />
          </View>
        </View>

        <Text style={styles.message}>
          You are about{"\n"}
          to confirm that{"\n"}
          you have started{"\n"}
          your transit trip{"\n"}
          with the Package
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cancel"
          onPress={() => router.back()}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />

        <CustomButton
          title="Start Trip"
          onPress={handleStartTrip}
          loading={isSubmitting}
          style={styles.startButton}
          textStyle={styles.startButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontFamily: "Figtree-Bold",
    fontSize: 20,
    color: Theme.colors.text.dark,
    fontWeight: "600",
  },
  moreButton: {
    padding: Theme.spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontFamily: "inter",
    fontSize: 34,
    textAlign: "center",
    color: Theme.colors.primary,
    lineHeight: 34,
    fontWeight: "300",
    marginBottom: Theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily:"inter",
    color: Theme.colors.text.dark,
    fontSize: 15,
  },
  startButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
  },
  startButtonText: {
    fontFamily: "inter",
    color: Theme.colors.white,
    fontSize: 15,
  },
});

export default StartTripScreen;
