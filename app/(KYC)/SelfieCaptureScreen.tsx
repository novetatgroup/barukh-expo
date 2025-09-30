import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import SelfieCaptureForm from "../components/forms/SelfieInterfaceForm";

export default function SelfieCaptureScreen() {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //TODO: add an api call 

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
        setSelfieImage(imageUri);
        console.log('Selfie captured:', imageUri);
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

  const handleSubmit = () => {
    if (!selfieImage) {
      Alert.alert(
        "No Selfie", 
        "Please take a selfie before submitting."
      );
      return;
    }
    
    console.log('Submitting selfie:', { selfieImage });
    
    Alert.alert(
      "Success", 
      "Selfie submitted successfully!",
      [{ 
        text: "OK", 
        onPress: () => {
          console.log("Navigate to next screen");
        }
      }]
    );
  };

  return (
    <View style={styles.container}>
      <SelfieCaptureForm
        selfieImage={selfieImage}
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