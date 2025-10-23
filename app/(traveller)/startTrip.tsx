import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";
import CustomButton from "../components/ui/CustomButton";
import { router } from "expo-router";

type StartTripScreenProps = {
  onCancel: () => void;
  onStartTrip: () => void;
};

const StartTripScreen: React.FC<StartTripScreenProps> = ({
  onCancel,
  onStartTrip,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Trip</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="airplane" size={40} color={Theme.colors.white} />
          </View>
        </View>

        <Text style={styles.message}>
          You are about{"\n"}
          to confirm that{"\n"}
          you have started{"\n"}
          your transit trip{"\n"}
          with the Package
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />

        <CustomButton
          title="Start Trip"
          onPress= {() => router.push('/(traveller)/deliveryUpload')}
          style={styles.startButton}
          textStyle={styles.startButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontFamily: "Figtree-Bold",
    fontSize: 20,
    color: Theme.colors.text.dark,
    fontWeight: "600",
  },
  moreButton: {
    padding: Theme.spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontFamily: "inter",
    fontSize: 34,
    textAlign: "center",
    color: Theme.colors.primary,
    lineHeight: 34,
    fontWeight: "300",
    marginBottom: Theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily:"inter",
    color: Theme.colors.text.dark,
    fontSize: 15,
  },
  startButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
  },
  startButtonText: {
    fontFamily: "inter",
    color: Theme.colors.white,
    fontSize: 15,
  },
});

export default StartTripScreen;
