import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import PackageDetailsForm from "../components/forms/traveller/PackageDetailsForm";
import { AuthContext } from "../context/AuthContext";
import { useShipment } from "../context/ShipmentContext";


const PackageDetailsScreen = () => {
  const travellerApiUrl = process.env.EXPO_PUBLIC_API_URL_TRAVELLER;

  const { authFetch, userId } = useContext(AuthContext);
  const { currentShipment, setIsTravelerActive, setCurrentShipment, clearCurrentShipment } = useShipment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (packageData: {
    allowedCategories: string[];
    maxWeightKg: number;
    maxHeightCm: number;
    maxWidthCm: number;
    maxLengthCm: number;
    originCountry: string;
    originCity: string;
    destinationCountry: string;
    destinationCity: string;
    departureAt: string;
    arrivalAt: string;
    mode: string;
    flightNumber?: string;
    vehiclePlate?: string;
  }) => {
    try {
      setIsSubmitting(true);

      console.log("Package Data from Form:", packageData);

      const apiPayload = {
        userId: userId,
        maxWeightKg: Number(packageData.maxWeightKg) || 0,
        maxHeightCm: Number(packageData.maxHeightCm) || 0,
        maxWidthCm: Number(packageData.maxWidthCm) || 0,
        maxLengthCm: Number(packageData.maxLengthCm),
        originCountry: packageData.originCountry,
        originCity: packageData.originCity,
        destinationCountry: packageData.destinationCountry,
        destinationCity: packageData.destinationCity,
        departureAt: packageData.departureAt,
        arrivalAt: packageData.arrivalAt,
        mode: packageData.mode,
        ...(packageData.mode === "FLIGHT" && packageData.flightNumber && {
          flightNumber: packageData.flightNumber,
        }),
        ...(packageData.mode === "CAR" && packageData.vehiclePlate && {
          vehiclePlate: packageData.vehiclePlate,
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
        originCountry: packageData.originCountry,
        originCity: packageData.originCity,
        destinationCountry: packageData.destinationCountry,
        destinationCity: packageData.destinationCity,
        departureAt: packageData.departureAt,
        arrivalAt: packageData.arrivalAt,
        mode: packageData.mode,
        flightNumber: packageData.flightNumber,
        vehiclePlate: packageData.vehiclePlate,
        allowedCategories: packageData.allowedCategories,
        maxWeightKg: Number(packageData.maxWeightKg),
        maxHeightCm: Number(packageData.maxHeightCm),
        maxWidthCm: Number(packageData.maxWidthCm),
        maxLengthCm: Number(packageData.maxLengthCm),
      }));

      setIsTravelerActive(true);

      Toast.success(
        "Trip successfully created! You will be notified when a match is found."
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
