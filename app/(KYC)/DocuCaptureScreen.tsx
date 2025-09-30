import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import DocumentCaptureForm from "../components/forms/DocuCaptureForm";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function DocumentCaptureScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //TODO: add an api call 

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to capture your document photos.',
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

  const handleTakePhoto = async (side: "front" | "back") => {
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
        aspect: [16, 10], 
        quality: 0.8,
        base64: false, 
        exif: false, 
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        if (side === "front") {
          setFrontImage(imageUri);
        } else {
          setBackImage(imageUri);
        }

        console.log(`${side} side captured:`, imageUri);
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
    if (!frontImage || !backImage) {
      Alert.alert(
        "Incomplete Submission", 
        "Please capture both the front and back sides of your ID before submitting."
      );
      return;
    }
    
    console.log('Submitting documents:', { frontImage, backImage });
    
    Toast.show({
    type: 'success',
    text1: 'Documents submitted successfully!',
    position: 'top',
    autoHide: true,  
    visibilityTime: 2000,
    
  });

  setTimeout(() => {
      router.push("/(KYC)/SelfieCaptureScreen");
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <DocumentCaptureForm
        documentType={type as "PASSPORT" | "ID" | "DRIVING LICENCE"} 
        frontImage={frontImage}
        backImage={backImage}
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