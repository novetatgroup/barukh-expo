import React from "react";
import { View, StyleSheet } from "react-native";
import DocumentTypeSelectionForm from "../components/forms/KYC/DocuTypeForm";
import { router } from "expo-router";

const DocumentTypeSelectionScreen = () => {

  const handleDocumentTypeSelect = (
  selectedType: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE",
) => {
  router.push({
    pathname: "/(KYC)/docuCaptureScreen",
    params: { type: selectedType },
  });
};

  return (
    <View style={styles.container}>
      <DocumentTypeSelectionForm onDocumentTypeSelect={handleDocumentTypeSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DocumentTypeSelectionScreen;