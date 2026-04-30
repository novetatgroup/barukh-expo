import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";
import TravellerDetailsForm from "@/components/forms/traveller/TravellerDetails";
import { useShipment } from "@/context/ShipmentContext";
import { AuthContext } from "@/context/AuthContext";

const TravellerDetailsScreen = () => {
	const { currentShipment, setCurrentShipment } = useShipment();
	const auth = useContext(AuthContext);

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
		spaceType: string;
		spaceNumber: string;
	}) => {
		const resolvedUserId = Number(auth.userId);

		if (!auth.userId || !Number.isFinite(resolvedUserId)) {
			Toast.error("You must be logged in to continue.");
			return;
		}

		console.log("Traveller Details submitted:", data);
		
		setCurrentShipment((prev) => ({ 
			...prev, 
			...data,
			userId: resolvedUserId,
		}));
		
		router.push("/(traveller)/packageDetails");
	};

	if (auth.loading) {
		return <View style={styles.container} />;
	}

	return (
		<View style={styles.container}>
			<TravellerDetailsForm
				onSubmit={handleSubmit}
				initialValues={{
					...currentShipment,
					userId: Number(auth.userId) || 0,
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default TravellerDetailsScreen;
