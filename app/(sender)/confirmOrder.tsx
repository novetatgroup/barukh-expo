import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ConfirmOrderScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
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
  }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const trackingParams = {
    shipmentId: params.shipmentId || "",
    orderId: params.orderId || "#01-BK1624",
    itemId: params.itemId || "#BK1624",
    itemName: params.itemName || "MacBook Pro",
    receiptUploaded: params.receiptUploaded || "false",
    trackingEntered: params.trackingEntered || "false",
    pickupCodeShared: params.pickupCodeShared || "false",
    deliveryCodeShared: params.deliveryCodeShared || "false",
    orderConfirmed: params.orderConfirmed || "false",
    verificationCompleted: params.verificationCompleted || "false",
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Confirm order picker error:", error);
      Alert.alert("Image failed", "Unable to select an order photo right now.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Camera Access Required",
          "Please enable camera access in your device settings to take a photo.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Confirm order camera error:", error);
      Alert.alert("Camera failed", "Unable to open the camera right now.");
    }
  };

  const handleReject = () => {
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: trackingParams,
    });
  };

  const handleConfirm = () => {
    if (!selectedImage) {
      Alert.alert("No image selected", "Please choose an image first.");
      return;
    }

    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: {
        ...trackingParams,
        orderConfirmed: "true",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReject} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Confirm Order</Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructionText}>
          Review or retake the order photo with the same upload flow used on the
          traveller side before confirming the item handoff.
        </Text>

        <TouchableOpacity
          style={styles.uploadArea}
          onPress={pickImage}
          activeOpacity={0.75}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons
                name="image-outline"
                size={48}
                color={Theme.colors.text.lightGray}
              />
              <Text style={styles.uploadText}>Select file</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={takePhoto}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={20} color={Theme.colors.white} />
          <Text style={styles.cameraButtonText}>Open Camera & Take Photo</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
            activeOpacity={0.85}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedImage && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Theme.colors.white} />
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
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
    paddingTop: Theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.black,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
  },
  uploadArea: {
    width: "100%",
    height: 280,
    borderWidth: 3,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: Theme.borderRadius.md,
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
    marginTop: Theme.spacing.sm,
  },
  orText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginVertical: Theme.spacing.md,
  },
  cameraButton: {
    flexDirection: "row",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
  },
  cameraButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  actionRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  rejectButton: {
    flex: 1,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
  },
  rejectButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  confirmButton: {
    flex: 1.4,
    flexDirection: "row",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary,
  },
  confirmButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ConfirmOrderScreen;
