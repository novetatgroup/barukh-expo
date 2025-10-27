import React, { useState, useContext } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import SelfieCaptureForm from "../components/forms/KYC/SelfieInterfaceForm";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import AuthContext from "@/app/context/AuthContext";
import convertImageUriToBase64 from "@/app/utils/imageConverter";
import KYCContext from "@/app/context/KYCContext";

export default function SelfieCaptureScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const { authFetch } = useContext(AuthContext);
  const { addImage, buildPayload } = useContext(KYCContext);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take your selfie.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
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
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;


        const base64Image = await convertImageUriToBase64({ imageUri });

        const image_type_id = 2;
        addImage({
          image_type_id: image_type_id,
          image: base64Image,
        })



      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error',
        'Unable to access camera. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {

      const payload = buildPayload();
      console.log("Submitting payload:", JSON.stringify(payload, null, 2));


      const response = await authFetch(`${apiUrl}/smile-id/document-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response) throw new Error("Failed to upload documents");

      Toast.show({
        type: 'success',
        text1: 'Documents submitted successfully!',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });

      setTimeout(() => {
        router.push("/(traveller)/travellerDetails");
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2: 'Please try again later.',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });

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