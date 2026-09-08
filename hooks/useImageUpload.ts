import { uploadService } from "@/services/uploadService";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import { Alert, Linking } from "react-native";

export interface PickedImage {
	slot: string;
	uri: string;
}

export interface UseImageUploadOptions {
	quality?: number;
}

/**
 * Generic pick -> track -> upload primitive, usable both for a fixed set of named slots
 * (KYC's selfie/id_front/id_back) and an open-ended list (complaint attachments, where the
 * caller assigns slot keys like `attachment-0`, `attachment-1`, ...). The presigned upload
 * URL for a slot is requested by the calling screen (its shape differs per domain) - this
 * hook only owns picking, in-flight upload tracking, and exposing loading/error state.
 */
export function useImageUpload(options?: UseImageUploadOptions) {
	const quality = options?.quality ?? 0.8;

	const [images, setImages] = useState<PickedImage[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const uploadPromises = useRef<Map<string, Promise<void>>>(new Map());

	const setImage = useCallback((slot: string, uri: string) => {
		setImages(prev => [...prev.filter(image => image.slot !== slot), { slot, uri }]);
	}, []);

	const pickFromLibrary = useCallback(
		async (slot: string) => {
			try {
				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ["images"],
					allowsEditing: true,
					aspect: [3, 4],
					quality,
				});

				if (!result.canceled && result.assets[0]) {
					setImage(slot, result.assets[0].uri);
				}
			} catch {
				Alert.alert("Selection failed", "Unable to select an image right now.");
			}
		},
		[quality, setImage]
	);

	const takePhoto = useCallback(
		async (slot: string) => {
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
					allowsEditing: true,
					aspect: [3, 4],
					quality,
				});

				if (!result.canceled && result.assets[0]) {
					setImage(slot, result.assets[0].uri);
				}
			} catch {
				Alert.alert("Camera failed", "Unable to open the camera right now.");
			}
		},
		[quality, setImage]
	);

	const removeImage = useCallback((slot: string) => {
		setImages(prev => prev.filter(image => image.slot !== slot));
		uploadPromises.current.delete(slot);
	}, []);

	// Kicks off the PUT to a presigned URL immediately (fire-and-forget, tracked internally).
	// The calling screen is responsible for obtaining `uploadUrl` from its own BE endpoint.
	const startUpload = useCallback((slot: string, uploadUrl: string, contentType?: string) => {
		const image = images.find(i => i.slot === slot);
		if (!image) return;
		uploadPromises.current.set(slot, uploadService.uploadToS3(image.uri, uploadUrl, contentType));
	}, [images]);

	const waitForAllUploads = useCallback(async (): Promise<void> => {
		setIsUploading(true);
		setError(null);
		try {
			await Promise.all(uploadPromises.current.values());
		} catch {
			setError("One or more images failed to upload.");
			throw new Error("One or more images failed to upload.");
		} finally {
			setIsUploading(false);
		}
	}, []);

	const reset = useCallback(() => {
		setImages([]);
		uploadPromises.current.clear();
		setError(null);
	}, []);

	return {
		images,
		isUploading,
		error,
		pickFromLibrary,
		takePhoto,
		removeImage,
		startUpload,
		waitForAllUploads,
		reset,
	};
}
