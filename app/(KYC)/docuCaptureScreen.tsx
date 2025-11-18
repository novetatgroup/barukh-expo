import React, { useContext, useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DocumentCaptureForm from "../components/forms/KYC/DocuCaptureForm";
import { router } from "expo-router";
import KYCContext from "@/app/context/KYCContext";

export default function DocumentCaptureScreen() {
  const [isLoading, setIsLoading] = useState(false);

	const { addImage } = useContext(KYCContext);

	const requestCameraPermission = async (): Promise<boolean> => {
		try {
			const { status } =
				await ImagePicker.requestCameraPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Camera Permission Required",
					"Please allow camera access to capture your document photos.",
					[
						{ text: "Cancel", style: "cancel" },
						{
							text: "Open Settings",
							onPress: () =>
								ImagePicker.requestCameraPermissionsAsync(),
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

	const handleTakePhoto = async (side: "front" | "back") => {
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
				aspect: [16, 10],
				quality: 0.8,
				exif: false,
			});

			if (!result.canceled && result.assets && result.assets[0]) {
				const imageUri = result.assets[0].uri;


				const image_type_id = side === "front" ? 3 : 7;
				addImage({
					image_type_id: image_type_id,
					image: imageUri,
				});
			}
		} catch (error) {
			console.error("Camera error:", error);
			Alert.alert(
				"Camera Error",
				"Unable to access camera. Please try again.",
				[{ text: "OK" }]
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = () => {
		router.push("/(KYC)/selfieCaptureScreen");
	};

	return (
		<View style={styles.container}>
			<DocumentCaptureForm
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
