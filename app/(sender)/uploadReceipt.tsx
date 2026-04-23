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

const UploadReceiptScreen = () => {
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

  const markReceiptUploaded = (imageUri: string) => {
    setSelectedImage(imageUri);
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: {
        ...trackingParams,
        receiptUploaded: "true",
      },
    });
  };

  const handleBack = () => {
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: trackingParams,
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        markReceiptUploaded(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Receipt picker error:", error);
      Alert.alert("Upload failed", "Unable to select a receipt right now.");
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
        markReceiptUploaded(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Receipt camera error:", error);
      Alert.alert("Camera failed", "Unable to open the camera right now.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Receipt</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructions}>
          Upload receipt shared by the recipient to continue tracking.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.uploadBox}
          onPress={pickImage}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.uploadIcon}>
                <Ionicons name="image-outline" size={30} color={Theme.colors.green} />
              </View>
              <Text style={styles.selectText}>Select file</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cameraButton}
          onPress={takePhoto}
        >
          <Ionicons name="camera-outline" size={20} color={Theme.colors.white} />
          <Text style={styles.cameraButtonText}>Open Camera & Take Photo</Text>
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
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
    alignItems: "center",
  },
  instructions: {
    maxWidth: 250,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.xl,
  },
  uploadBox: {
    width: "100%",
    minHeight: 220,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Theme.colors.green,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EAF8EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
  },
  selectText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  orRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Theme.spacing.xl,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8D8D8",
  },
  orText: {
    marginHorizontal: Theme.spacing.sm,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  cameraButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
  },
  cameraButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default UploadReceiptScreen;
