import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import PackageDetailsForm from "../components/forms/traveller/PackageDetailsForm";
import { ShipmentData, useShipment } from "../context/ShipmentContext";

const PackageDetailsScreen = () => {
  const router = useRouter();
  const { currentShipment, setIsTravelerActive } = useShipment();

  const handleSubmit = (data: Partial<ShipmentData>) => {
    const fullShipmentData = { ...currentShipment, ...data };

    console.log("Submitting full shipment data (traveller + package):");
    console.log(JSON.stringify(fullShipmentData, null, 2));
    setIsTravelerActive(true);

    Toast.success(
      "Status updated successfully! You will be notified when a match is found."
    );

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
