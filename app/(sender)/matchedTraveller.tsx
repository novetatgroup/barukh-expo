import CustomButton from "@/app/components/ui/CustomButton";
import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MatchedTravellerScreen = () => {
  const { tripId, packageId } = useLocalSearchParams<{
    tripId: string;
    packageId: string;
  }>();

  const handleViewDetails = () => {
    // TODO: call traveller/trip details API and show full info
    router.replace("/(tabs)/home");
  };

  const handleGoHome = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={Theme.colors.green}
          />
        </View>

        <Text style={styles.title}>Traveller Found!</Text>
       {/*  <Text style={styles.subtitle}>
          We've found a traveller who can{"\n"}deliver your package.
        </Text>
        <Text style={styles.subtitle}>
          This is a temporary screen until i finish the issues 
        </Text> */}

        <View style={styles.buttons}>
        {/*   <CustomButton
            title="View Traveller Details"
            variant="primary"
            onPress={handleViewDetails}
            style={styles.button}
          /> */}
          <CustomButton
            title="Go Home"
            variant="secondary"
            onPress={handleGoHome}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  buttons: {
    width: "100%",
    marginTop: Theme.spacing.xxl,
    gap: 12,
  },
  button: {
    width: "100%",
  },
});

export default MatchedTravellerScreen;
