import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import PackageDetailsForm from "../components/forms/traveller/PackageDetailsForm";
import { useShipment } from "../context/ShipmentContext";
import { ShipmentData } from "../context/ShipmentContext";
import Toast from "react-native-toast-message";

const PackageDetailsScreen = () => {
	const router = useRouter();
	const { currentShipment, setIsTravelerActive } = useShipment();

	const handleSubmit = (data: Partial<ShipmentData>) => {
		const fullShipmentData = { ...currentShipment, ...data };

		console.log("Submitting full shipment data (traveller + package):");
		console.log(JSON.stringify(fullShipmentData, null, 2));
		setIsTravelerActive(true);

		Toast.show({
			type: "success",
			text1: "Status Updated Successfully",
			text2: "You will be notified when a match is found",
			position: "top",
			visibilityTime: 2000,
		});

		setTimeout(() => {
			router.push("/(traveller)/home");
		}, 600);
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
