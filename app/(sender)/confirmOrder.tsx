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
    orderId?: string;
    itemId?: string;
    itemName?: string;
    receiptUploaded?: string;
    trackingEntered?: string;
    orderConfirmed?: string;
  }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const trackingParams = {
    orderId: params.orderId || "#01-BK1624",
    itemId: params.itemId || "#BK1624",
    itemName: params.itemName || "MacBook Pro",
    receiptUploaded: params.receiptUploaded || "false",
    trackingEntered: params.trackingEntered || "false",
    orderConfirmed: params.orderConfirmed || "false",
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
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
        mediaTypes: ["images"],
        allowsEditing: true,
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

  const openImageOptions = () => {
    Alert.alert("Confirm Order", "Choose an order image.", [
      { text: "Select Image", onPress: pickImage },
      { text: "Open Camera", onPress: takePhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleReject = () => {
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: trackingParams,
    });
  };

  const handleConfirm = () => {
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
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <Text style={styles.metaTitle}>Image shared by Miles Okello</Text>
          <Text style={styles.metaTime}>09:34</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.imageFrame}
          onPress={openImageOptions}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <View style={styles.placeholderSurface}>
                <View style={styles.placeholderDevice}>
                  <Ionicons
                    name="image-outline"
                    size={42}
                    color={Theme.colors.primary}
                  />
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
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
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  metaTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
    paddingRight: Theme.spacing.sm,
  },
  metaTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
  },
  imageFrame: {
    width: "100%",
    aspectRatio: 0.82,
    borderRadius: 18,
    backgroundColor: Theme.colors.white,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: "#E8ECEB",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.lg,
  },
  placeholderSurface: {
    width: "100%",
    height: "78%",
    borderRadius: 18,
    backgroundColor: "#D7DFDC",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderDevice: {
    width: 138,
    height: 92,
    borderRadius: 14,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: "#D9D9D9",
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default ConfirmOrderScreen;
