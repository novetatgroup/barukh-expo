import { router } from "expo-router";
import React, { useState , useContext} from "react";
import { StyleSheet, View} from "react-native";
import { Toast } from "toastify-react-native";
import PackageDetailsForm from "../components/forms/traveller/PackageDetailsForm";
import { useShipment } from "../context/ShipmentContext";
import { AuthContext } from "../context/AuthContext";


const PackageDetailsScreen = () => {
  const travellerApiUrl = process.env.EXPO_PUBLIC_API_URL_TRAVELLER;

  const { authFetch, userId } = useContext(AuthContext);
  const { currentShipment, setIsTravelerActive, setCurrentShipment, clearCurrentShipment } = useShipment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (packageData: {
    allowedCategories: string[];
    maxWeightKg: Number;
    maxHeightCm: Number;
    maxWidthCm: Number;
    maxLengthCm:Number;
  }) => {
    try {
      setIsSubmitting(true);

      console.log("Current Shipment from Context:", currentShipment);
      console.log("Package Data from Form:", packageData);

      if (!currentShipment.originCountry || !currentShipment.destinationCountry) {
        throw new Error("Missing traveller details. Please go back and fill the form.");
      }

      const apiPayload = {
        userId: userId,
        maxWeightKg: Number(packageData.maxWeightKg) || 0,
        maxHeightCm: Number(packageData.maxHeightCm) || 0,
        maxWidthCm: Number(packageData.maxWidthCm) || 0,
        maxLengthCm: Number(packageData.maxLengthCm), 
        originCountry: currentShipment.originCountry,
        originCity: currentShipment.originCity,
        destinationCountry: currentShipment.destinationCountry,
        destinationCity: currentShipment.destinationCity,
        departureAt: currentShipment.departureAt,
        arrivalAt: currentShipment.arrivalAt,
        mode: currentShipment.mode,
        ...(currentShipment.mode === "FLIGHT" && currentShipment.flightNumber && { 
          flightNumber: currentShipment.flightNumber 
        }),
        ...(currentShipment.mode === "CAR" && currentShipment.vehiclePlate && { 
          vehiclePlate: currentShipment.vehiclePlate 
        }),
      };

      console.log("API Payload:", JSON.stringify(apiPayload, null, 2));

      const response = await authFetch(`${travellerApiUrl}/traveller/create-trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log("Non-JSON Response:", text);
        responseData = { message: text };
      }
      if (!response.ok) {
        console.error("API Error Response:", responseData);
        throw new Error(
          responseData.message || 
          responseData.error || 
          `Failed to create trip (Status: ${response.status})`
        );
      }

      console.log("Trip created successfully:", responseData);

      setCurrentShipment(prev => ({
        ...prev,
        allowedCategories: packageData.allowedCategories,
        maxWeightKg: Number(packageData.maxWeightKg),
        maxHeightCm: Number(packageData.maxHeightCm),
        maxWidthCm: Number(packageData.maxWidthCm),
        maxLengthCm:Number(packageData.maxLengthCm)
      }));

      setIsTravelerActive(true);

      Toast.success(
        "Trip created successfully! You will be notified when a match is found."
      );
      setTimeout(() => {
        clearCurrentShipment();
        router.push("/(traveller)/home");
      }, 600);

    } catch (error) {
      console.error("Error submitting trip:", error);
      
       const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create trip. Please check your connection and try again.";
      
      Toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <PackageDetailsForm
        onSubmit={handleSubmit}
        initialValues={currentShipment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PackageDetailsScreen;
