import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";

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
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startButton} onPress={onStartTrip}>
          <Text style={styles.startButtonText}>Start Trip</Text>
        </TouchableOpacity>
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
    fontWeight:'600',
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
    fontFamily: "Figtree-Regular",
    fontSize: 30,
    textAlign: "center",
    color: Theme.colors.primary,
    lineHeight: 30,
    fontWeight:'300',
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
    paddingVertical: Theme.spacing.sm, 
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: "Figtree-SemiBold",
    color: Theme.colors.text.dark,
    fontSize: 15,
  },
  startButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontFamily: "Figtree-SemiBold",
    color: Theme.colors.white,
    fontSize: 15,
  },
});

export default StartTripScreen;
