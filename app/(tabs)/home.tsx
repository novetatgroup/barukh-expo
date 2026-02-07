import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRole } from "@/app/context/RoleContext";
import TravellerHomeContent from "@/app/components/home/TravellerHomeContent";
import SenderHomeContent from "@/app/components/home/SenderHomeContent";
import Theme from "@/app/constants/Theme";

const HomeScreen = () => {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === "TRAVELLER" ? <TravellerHomeContent /> : <SenderHomeContent />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
  },
});

export default HomeScreen;
