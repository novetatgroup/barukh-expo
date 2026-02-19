import { router, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import CreateShipmentForm from "../components/forms/sender/CreateShipmentForm";
import { ShipmentSubmitData } from "../components/forms/sender/shipmentForm";
import { AuthContext } from "../context/AuthContext";
import { senderService } from "../services/senderService";

const CreateShipmentScreen = () => {
  const { senderId } = useLocalSearchParams<{ senderId: string }>();
  const { accessToken } = useContext(AuthContext);

  const handleSubmit = async (shipmentData: ShipmentSubmitData) => {
    if (!senderId || !accessToken) {
      Toast.error("Missing sender information. Please go back and try again.");
      return;
    }

    try {
      const { photoUri, ...packageFields } = shipmentData;

      const result = await senderService.createPackage(
        { senderId, ...packageFields },
        accessToken
      );

      if (!result.ok) {
        throw new Error(result.error || "Failed to create package");
      }



      // Upload photo to S3 URL
      if (photoUri && result.data?.photoUrl) {
        try {
          const response = await fetch(photoUri);
          const blob = await response.blob();

          const uploadResponse = await fetch(result.data.photoUrl, {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": blob.type || "image/jpeg",
            },
          });

          if (!uploadResponse.ok) {
            console.error("Photo upload failed:", uploadResponse.status);
            Toast.error("Package created but photo upload failed.");
          }
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          Toast.error("Package created but photo upload failed.");
        }
      }

      router.push({
        pathname: "/(sender)/findingTraveller",
        params: {
          senderId,
          packageId: result.data?.id || "",
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to create package. Please try again.";
      Toast.error(errorMessage);
      console.error("Error creating package:", error);
    }
  };

  return (
    <View style={styles.container}>
      <CreateShipmentForm onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default CreateShipmentScreen;
