import AuthContext from "@/context/AuthContext";
import KYCContext from "@/context/KYCContext";
import { kycService } from "@/services/kycService";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import DocumentTypeSelectionForm from "@/components/forms/KYC/DocuTypeForm";

const DocumentTypeSelectionScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, userId } = useContext(AuthContext);
  const { setUploadData } = useContext(KYCContext);

  const handleDocumentTypeSelect = async (
    selectedType: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE",
  ) => {
    if (isLoading || !userId || !accessToken) return;
    setIsLoading(true);

    try {
      const { data, error } = await kycService.getUploadUrls(userId, accessToken);

      if (error || !data) {
        Toast.error(error ?? "Failed to initialise verification. Please try again.");
        return;
      }

      setUploadData(data.urls, data.jobId);

      router.push({
        pathname: "/(KYC)/docuCaptureScreen",
        params: { type: selectedType },
      });
    } catch (err) {
      console.error("Upload URL fetch error:", err);
      Toast.error("Failed to initialise verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <DocumentTypeSelectionForm
        onDocumentTypeSelect={handleDocumentTypeSelect}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DocumentTypeSelectionScreen;
