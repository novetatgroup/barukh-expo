import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { router } from "expo-router";
import UploadPackageForm from "../components/forms/traveller/UploadPackageForm";

const UploadPackageScreen = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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

    const handleUpload = async () => {
        if (!selectedImage) {
            Alert.alert("No image selected", "Please choose an image first.");
            return;
        }

        router.push("/(traveller)/startTrip");
    };

    return (
        <UploadPackageForm
            onBack={() => router.back()}
            onPickImage={pickImage}
            onTakePhoto={takePhoto}
            onUpload={handleUpload}
            selectedImage={selectedImage}
        />
    );
};

export default UploadPackageScreen;
