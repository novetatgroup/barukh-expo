import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import HomeForm from "../components/forms/traveller/HomeForm";
import { useShipment } from "../context/ShipmentContext";

const TravellerHomeScreen = () => {
  const router = useRouter();
  const { isTravelerActive, setIsTravelerActive } = useShipment();

  const handleActivateTravelerMode = () => {
    if (!isTravelerActive) {
      router.push("/(KYC)/KYCLanding");
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
        onNavigateToShipments={(tab) =>
          router.push({
            pathname: "/(traveller)/myShipments",
            params: { tab: tab || "Shipments" },
          })
        }
        isTravelerActive={isTravelerActive}
        shipments={[
          {
            id: "6",
            trackingNumber: "#SK1058",
            item: "MacBook Pro",
            status: "Shipments",
            progress: "In Transit",
          },
          {
            id: "7",
            trackingNumber: "#SK1059",
            item: "iPhone 15 Pro",
            status: "Shipments",
            progress: "Delivered",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default TravellerHomeScreen;
