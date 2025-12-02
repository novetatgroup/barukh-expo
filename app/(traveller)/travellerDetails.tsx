import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import TravellerDetailsForm from "../components/forms/traveller/TravellerDetails";
import { useShipment } from "../context/ShipmentContext";
import AuthContext from "../context/AuthContext";

const TravellerDetailsScreen = () => {
	const { setCurrentShipment } = useShipment();

	const handleSubmit =  async (data: {
		userId: number;
		originCountry: string;
		originCity: string;
		destinationCountry: string;
		destinationCity: string;
		departureDate: string;
		departureAt: string;
		arrivalDate: string;
		arrivalAt: string;
		mode?: string;
		flightNumber?: string;
		vehiclePlate?: string;
	}) => {
		console.log("Traveller Details submitted:", data);
		
		setCurrentShipment((prev) => ({ 
			...prev, 
			...data 
		}));
		
		router.push("/(traveller)/packageDetails");
	};

	return (
		<View style={styles.container}>
			<TravellerDetailsForm onSubmit={handleSubmit} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default TravellerDetailsScreen;
