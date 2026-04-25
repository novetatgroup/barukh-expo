import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadPackageForm from "@/components/forms/traveller/UploadPackageForm";

const UploadPackageScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{
        itemId?: string;
        itemName?: string;
        progress?: string;
        tripStarted?: string;
        verificationCompleted?: string;
        deliveryPhotoUploaded?: string;
    }>();
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

        router.push({
            pathname: "/(traveller)/trackingDetails",
            params: {
                itemId: params.itemId || "#BK1624",
                itemName: params.itemName || "MacBook Pro",
                progress: params.progress || "In Transit",
                packageUploaded: "true",
                tripStarted: params.tripStarted || "false",
                verificationCompleted: params.verificationCompleted || "false",
                deliveryPhotoUploaded: params.deliveryPhotoUploaded || "false",
            },
        });
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
