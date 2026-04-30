import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import PackageDetailsForm from "@/components/forms/traveller/PackageDetailsForm";
import { AuthContext } from "@/context/AuthContext";
import { useShipment } from "@/context/ShipmentContext";
import { CreateTripParams, travellerService } from "@/services/travellerService";

const isFiniteNumber = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const PackageDetailsScreen = () => {
  const { accessToken, userId } = useContext(AuthContext);
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
    originLatitude?: number;
    originLongitude?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
    departureAt: string;
    arrivalAt: string;
    mode: string;
    flightNumber?: string;
    vehiclePlate?: string;
  }) => {
    if (!accessToken || !userId) {
      Toast.error("You must be logged in to create a trip.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Ensure traveller profile exists before creating a trip
      const travellerResult = await travellerService.createTraveller({ userId }, accessToken);
      let resolvedTravellerId = travellerResult.data?.travellerId;

      if (!travellerResult.ok || !resolvedTravellerId) {
        const getResult = await travellerService.getTraveller(userId, accessToken);
        if (!getResult.ok || !getResult.data?.travellerId) {
          Toast.error(getResult.error || "Unable to retrieve your traveller profile. Please try again.");
          return;
        }
        resolvedTravellerId = getResult.data.travellerId;
      }

      // Build trip payload
      const tripPayload: CreateTripParams = {
        userId,
        maxWeightKg: Number(packageData.maxWeightKg) || 0,
        maxHeightCm: Number(packageData.maxHeightCm) || 0,
        maxWidthCm: Number(packageData.maxWidthCm) || 0,
        maxLengthCm: Number(packageData.maxLengthCm),
        originCountry: packageData.originCountry,
        originCity: packageData.originCity,
        destinationCountry: packageData.destinationCountry,
        destinationCity: packageData.destinationCity,
        ...(isFiniteNumber(packageData.originLatitude) && isFiniteNumber(packageData.originLongitude) && {
          originLat: packageData.originLatitude,
          originLon: packageData.originLongitude,
        }),
        ...(isFiniteNumber(packageData.destinationLatitude) && isFiniteNumber(packageData.destinationLongitude) && {
          destinationLat: packageData.destinationLatitude,
          destinationLon: packageData.destinationLongitude,
        }),
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

      const tripResult = await travellerService.createTrip(tripPayload, accessToken);
      if (!tripResult.ok) {
        Toast.error(tripResult.error || "Failed to create trip");
        return;
      }

      setCurrentShipment(prev => ({
        ...prev,
        originCountry: packageData.originCountry,
        originCity: packageData.originCity,
        destinationCountry: packageData.destinationCountry,
        destinationCity: packageData.destinationCity,
        originLatitude: packageData.originLatitude,
        originLongitude: packageData.originLongitude,
        destinationLatitude: packageData.destinationLatitude,
        destinationLongitude: packageData.destinationLongitude,
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
        router.push("/(tabs)/home");
      }, 600);
    } catch (error) {
      console.error("Error submitting trip:", error);
      Toast.error("Failed to create trip. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <PackageDetailsForm
        onSubmit={handleSubmit}
        initialValues={currentShipment}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PackageDetailsScreen;
