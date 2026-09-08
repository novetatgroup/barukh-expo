import AuthContext from "@/context/AuthContext";
import KYCContext from "@/context/KYCContext";
import { kycService } from "@/services/kycService";
import { uploadService } from "@/services/uploadService";
import { router } from "expo-router";
import React, { useContext, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import KYCCameraFlow from "@/components/forms/KYC/KYCCameraFlow";

type CapturedImage = { image_type_id: number; image: string };

const IMAGE_TYPE_TO_SLOT: Record<number, "id_front" | "id_back" | "selfie"> = {
  3: "id_front",
  7: "id_back",
  2: "selfie",
};

// Inverse of IMAGE_TYPE_TO_SLOT - used to build the submission payload generically, since
// the slot set returned by uploadUrls varies by document type (a passport has no "id_back").
const SLOT_TO_IMAGE_TYPE: Record<string, number> = {
  selfie: 2,
  id_front: 3,
  id_back: 7,
};

export default function DocumentCaptureScreen() {
  const { accessToken, userId } = useContext(AuthContext);
  const { id_type, uploadUrls, jobId } = useContext(KYCContext);

  // Stores in-flight S3 upload promises keyed by slot name
  const uploadPromises = useRef<Map<string, Promise<void>>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Called immediately after each image is confirmed — starts S3 upload right away
  const handleImageCaptured = (image: CapturedImage) => {
    const slot = IMAGE_TYPE_TO_SLOT[image.image_type_id];
    if (!slot || !uploadUrls) return;
    uploadPromises.current.set(slot, uploadService.uploadToS3(image.image, uploadUrls[slot].uploadUrl));
  };

  const handleComplete = async (_images: CapturedImage[]) => {
    if (!userId || !id_type || !accessToken) {
      Toast.error("Please capture all document images and selfie before submitting.");
      return;
    }
    if (!uploadUrls || !jobId) {
      Toast.error("Verification session expired. Please go back and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Await any still-in-flight S3 uploads
      await Promise.all(uploadPromises.current.values());

      const { data, error } = await kycService.submitVerification(
        {
          userId,
          jobId,
          idInfo: {
            idType: id_type,
            countryTypes: "UG", // TODO: read from user profile once backend provides it
          },
          images: Object.entries(uploadUrls).map(([slot, entry]) => ({
            imageTypeId: SLOT_TO_IMAGE_TYPE[slot],
            imageKey: entry.key,
          })),
        },
        accessToken
      );

      if (error || !data) {
        Toast.error(error ?? "Submission failed. Please try again.");
        return;
      }

      Toast.success("Documents submitted successfully!");
      setTimeout(() => router.push("/(KYC)/verificationPendingScreen"), 1500);
    } catch {
      Toast.error("Submission failed. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KYCCameraFlow
        onImageCaptured={handleImageCaptured}
        onComplete={handleComplete}
        onClose={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
