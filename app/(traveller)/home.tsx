import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import HomeForm from "../components/forms/traveller/HomeForm";
import { useShipment } from "../context/ShipmentContext"; 

const HomeScreen = () => {
  const router = useRouter();
  const {isTravelerActive, setIsTravelerActive} = useShipment();

  const handleActivateTravelerMode = () => {
     if (!isTravelerActive) {
      router.push("/(traveller)/travellerDetails");
    } else {
      setIsTravelerActive(false);
    }
  };

  return (
    <View style={styles.container}>
      <HomeForm
        userName="Naomi Nyakaru"
        onActivateTravelerMode={handleActivateTravelerMode}
        onNavigateToDetails={() => router.push("/(traveller)/travellerDetails")}
        onNavigateToShipments={() => router.push("/(traveller)/myShipments")}
        isTravelerActive={isTravelerActive} shipments={[]}      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default HomeScreen;