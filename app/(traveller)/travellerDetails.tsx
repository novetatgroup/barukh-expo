import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import TravellerDetailsForm from "../components/forms/traveller/TravellerDetails";
import { useShipment } from "../context/ShipmentContext";
import { ShipmentData } from "../context/ShipmentContext";

const TravellerDetailsScreen = () => {
	const router = useRouter();
	const { setCurrentShipment } = useShipment();

	const handleSubmit = (data: Partial<ShipmentData>) => {
		console.log("Traveller Details submitted:", data);
		setCurrentShipment((prev) => ({ ...prev, ...data }));

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
