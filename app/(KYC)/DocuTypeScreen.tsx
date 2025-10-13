import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import DocumentTypeSelectionForm from "../components/forms/DocuTypeForm";
import { router } from "expo-router";

//TODO: add an api call 

const DocumentTypeSelectionScreen = () => {
  //const { authFetch } = useContext(AuthContext);
  //const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleDocumentType = async (document_type: "PASSPORT" | "ID" | "DRIVING LICENCE") => {
    router.push({
    pathname: "/(KYC)/DocuCaptureScreen",
    params: { type: document_type }, 
  });


    // try {
    //   const response = await authFetch(`${apiUrl}/doocutype`, {
    //     method: "PATCH",
    //     body: JSON.stringify({ document_type }),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     Toast.show({
    //       type: "success",
    //       text1: `Submit an image of your document!`,
    //     });
    //   } else {
    //     Toast.show({
    //       type: "error",
    //       text1: "Selection failed",
    //       text2: data.message || "Please try again",
    //     });
    //   }
    // } catch (error) {
    //   Toast.show({
    //     type: "error",
    //     text1: "Network error",
    //     text2: "Try again later",
    //   });
    // }
  };

  return (
    <View style={styles.container}>
      <DocumentTypeSelectionForm onDocumentTypeSelect={handleDocumentType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DocumentTypeSelectionScreen;