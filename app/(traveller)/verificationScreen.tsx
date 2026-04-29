import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { travellerService } from "@/services/travellerService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VerificationScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
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
  const [code, setCode] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleVerify = async () => {
    if (!params.shipmentId) {
      Alert.alert("Missing shipment", "No shipment was provided for delivery verification.");
      return;
    }

    if (!accessToken) {
      Alert.alert("Authentication required", "Please sign in and try again.");
      return;
    }

    if (!code.trim()) {
      Alert.alert("Invalid code", "Enter the sender delivery code to continue.");
      return;
    }

    if (!selectedImage && !params.deliveryPhotoKey) {
      Alert.alert("Missing delivery photo", "Upload a delivery photo before confirming delivery.");
      return;
    }

    setSubmitting(true);

    try {
      let deliveryPhotoKey = params.deliveryPhotoKey || "";

      if (selectedImage) {
        const uploadUrlResult = await travellerService.getShipmentUploadUrl(
          params.shipmentId,
          accessToken
        );

        if (!uploadUrlResult.ok || !uploadUrlResult.data?.uploadUrl || !uploadUrlResult.data.key) {
          Alert.alert(
            "Upload unavailable",
            uploadUrlResult.error || "Unable to prepare the delivery upload."
          );
          return;
        }

        await travellerService.uploadImageToS3(selectedImage, uploadUrlResult.data.uploadUrl);
        deliveryPhotoKey = uploadUrlResult.data.key;
      }

      const result = await travellerService.confirmItemDelivery(
        {
          code: code.trim(),
          shipmentId: params.shipmentId,
          deliveryPhotoKey,
        },
        accessToken
      );

      if (!result.ok) {
        Alert.alert(
          "Invalid delivery code",
          result.error || "Please confirm the code and try again."
        );
        return;
      }

      router.push({
        pathname: "/(traveller)/trackingDetails",
        params: {
          shipmentId: params.shipmentId || "",
          itemId: params.itemId || "#BK1624",
          itemName: params.itemName || "MacBook Pro",
          progress: "Delivered",
          packageUploaded: params.packageUploaded || "false",
          confirmPickUpCompleted: params.confirmPickUpCompleted || "false",
          tripStarted: params.tripStarted || "false",
          verificationCompleted: "true",
          deliveryPhotoUploaded: "true",
          confirmDeliveryCompleted: "true",
          deliveryPhotoKey,
        },
      });
    } catch (error) {
      console.error("Delivery verification error:", error);
      console.log({message:"Delivery verification error:", error});
      Alert.alert("Verification failed", "Unable to confirm delivery right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasDeliveryPhoto = Boolean(selectedImage || params.deliveryPhotoKey);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={Theme.colors.primary} />
        </View>
        <Text style={styles.title}>Confirm delivery</Text>
        <Text style={styles.subtitle}>
          Upload the delivery photo and enter the sender&apos;s delivery code to finalize this shipment.
        </Text>

        <View style={styles.photoCard}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderWrap}>
              <Ionicons
                name={params.deliveryPhotoKey ? "checkmark-circle-outline" : "image-outline"}
                size={28}
                color={Theme.colors.primary}
              />
              <Text style={styles.placeholderTitle}>
                {params.deliveryPhotoKey ? "Delivery photo ready" : "No delivery photo selected"}
              </Text>
              <Text style={styles.placeholderText}>
                {params.deliveryPhotoKey
                  ? "Choose a new image if you want to replace the existing delivery proof."
                  : "Pick an image from your gallery or take a fresh delivery photo."}
              </Text>
            </View>
          )}

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={18} color={Theme.colors.primary} />
              <Text style={styles.photoActionText}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={18} color={Theme.colors.primary} />
              <Text style={styles.photoActionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          value={code}
          onChangeText={(value) =>
            setCode(value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12))
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          placeholder="Enter code"
          placeholderTextColor={Theme.colors.text.lightGray}
          style={styles.input}
        />

        <CustomButton
          title="Confirm Delivery"
          onPress={handleVerify}
          disabled={!code.trim() || !hasDeliveryPhoto}
          loading={submitting}
          style={styles.verifyButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.lg,
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
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.lg,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  photoCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  placeholderWrap: {
    minHeight: 180,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  placeholderTitle: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  photoActions: {
    flexDirection: "row",
    columnGap: Theme.spacing.sm,
  },
  photoActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    backgroundColor: Theme.colors.background.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  photoActionText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
  },
  verifyButton: {
    marginTop: Theme.spacing.xl,
  },
});

export default VerificationScreen;
