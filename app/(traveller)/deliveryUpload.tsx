import React, { useContext, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadPackageForm from "@/components/forms/traveller/UploadPackageForm";
import { AuthContext } from "@/context/AuthContext";
import { travellerService } from "@/services/travellerService";

const DeliveryUploadScreen = () => {
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
        confirmDeliveryCompleted?: string;
        deliveryPhotoKey?: string;
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

        if (!params.shipmentId) {
            Alert.alert("Missing shipment", "No shipment was provided for this upload.");
            return;
        }

        if (!accessToken) {
            Alert.alert("Authentication required", "Please sign in and try again.");
            return;
        }

        try {
            const uploadUrlResult = await travellerService.getShipmentUploadUrl(
                params.shipmentId,
                accessToken
            );

            if (!uploadUrlResult.ok || !uploadUrlResult.data?.uploadUrl || !uploadUrlResult.data.key) {
                Alert.alert("Upload unavailable", uploadUrlResult.error || "Unable to prepare the delivery upload.");
                return;
            }

            await travellerService.uploadImageToS3(
                selectedImage,
                uploadUrlResult.data.uploadUrl
            );

            router.push({
                pathname: "/(traveller)/trackingDetails",
                params: {
                    shipmentId: params.shipmentId,
                    itemId: params.itemId || "#BK1624",
                    itemName: params.itemName || "MacBook Pro",
                    progress: params.progress || "In Transit",
                    packageUploaded: params.packageUploaded || "false",
                    confirmPickUpCompleted: params.confirmPickUpCompleted || "false",
                    tripStarted: params.tripStarted || "false",
                    verificationCompleted: params.verificationCompleted || "false",
                    deliveryPhotoUploaded: "true",
                    confirmDeliveryCompleted: params.confirmDeliveryCompleted || "false",
                    deliveryPhotoKey: uploadUrlResult.data.key,
                },
            });
        } catch (error) {
            console.error("Delivery upload error:", error);
            Alert.alert("Upload failed", "Unable to upload the delivery photo right now.");
        }
    };

    return (
        <UploadPackageForm
            onBack={() => router.back()}
            onPickImage={pickImage}
            onTakePhoto={takePhoto}
            onUpload={handleUpload}
            selectedImage={selectedImage}
            title="Upload Delivery Photo"
            instructionText="Upload a clear delivery photo to justify the handoff and confirm the package reached the recipient safely."
        />
    );
};

export default DeliveryUploadScreen;
