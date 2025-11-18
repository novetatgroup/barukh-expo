import AuthContext from "@/app/context/AuthContext";
import KYCContext from "@/app/context/KYCContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import SelfieCaptureForm from "../components/forms/KYC/SelfieInterfaceForm";

export default function SelfieCaptureScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const { authFetch } = useContext(AuthContext);
  const { addImage, buildPayload } = useContext(KYCContext);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take your selfie.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => ImagePicker.requestCameraPermissionsAsync(),
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Permission request error:", error);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);

      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        const image_type_id = 2;
        addImage({
          image_type_id: image_type_id,
          image: imageUri,
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Toast.error(
        "Camera Error Unable to access camera. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload();

      if (!payload.userId || !payload.idInfo || !payload.idInfo.id_type || !payload.idInfo.country || payload.images.length < 3) {
        Toast.error("Please capture all document images and selfie before submitting.");
        return;
      }

      const formData = new FormData();

      formData.append("userId", payload.userId.toString());
      formData.append("id_info[id_type]", payload.idInfo.id_type);
      formData.append("id_info[country]", payload.idInfo.country);

      payload.images.forEach((img, index) => {
        formData.append("images", {
          uri: img.image,
          type: "image/jpeg",
          name: `image_${index}.jpg`,
        } as unknown as Blob);
      });

      payload.images.forEach((img, index) => {
        formData.append(`image_type_ids[${index}]`, img.image_type_id.toString());
      });

      console.log("📦 FormData being sent to server:");
      console.log("Images order and their types:");
      payload.images.forEach((img, index) => {
        console.log(`  Index ${index}: image_type_id = ${img.image_type_id} (${img.image_type_id === 2 ? 'SELFIE' :
            img.image_type_id === 3 ? 'ID_FRONT' :
              img.image_type_id === 7 ? 'ID_BACK' : 'UNKNOWN'
          })`);
      });

      for (let [key, value] of (formData as any).entries()) {
        console.log(`${key}:`, value);
      }

      const response = await authFetch(
        `${apiUrl}/smile-id/document-verification`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response) throw new Error("Failed to upload documents");

      Toast.success("Documents submitted successfully!");

      setTimeout(() => {
        router.push("/(traveller)/travellerDetails");
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);
      Toast.error("Submission failed. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <SelfieCaptureForm
        isLoading={isLoading}
        onTakePhoto={handleTakePhoto}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
