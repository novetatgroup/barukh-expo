import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";
import CustomButton from "../../ui/CustomButton";

interface TrackingDetailsFormProps {
  trackingNumber: string;
  itemName: string;
  currentStep: number;
  onClose: () => void;
  onBack: () => void;
}

const TrackingDetailsForm: React.FC<TrackingDetailsFormProps> = ({
  trackingNumber,
  itemName,
  currentStep,
  onClose,
  onBack,
}) => {
  const steps = [
    { label: "Upload Package", completed: currentStep >= 1 },
    { label: "Start Trip", completed: currentStep >= 2 },
    { label: "Upload Delivery Photo", completed: currentStep >= 3 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tracking Details</Text>
        </View>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <View style={styles.topRow}>
            <Ionicons
              name="cube-outline"
              size={30}
              color={Theme.colors.yellow}
              style={styles.cube}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.trackingNumber}>{trackingNumber}</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Order Status</Text>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepCircle,
                    step.completed && styles.stepCircleCompleted,
                    currentStep === index && styles.stepCircleActive,
                  ]}
                >
                  {step.completed ? (
                    <Ionicons name="checkmark" size={16} color={Theme.colors.white} />
                  ) : null}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.completed && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === index && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity>
          <CustomButton
            title="Close"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  cube: {
    borderRadius: 15,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.black,
    marginBottom: Theme.spacing.xs,
  },
  itemName: {
    fontSize: 14,
    color: Theme.colors.text.gray,
  },
  statusSection: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.black,
    marginBottom: Theme.spacing.md,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    fontWeight: "600",
    marginBottom: Theme.spacing.sm,
  },
  stepIndicator: {
    fontWeight: "600",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepCircleActive: {
  

  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    backgroundColor: Theme.colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.text.gray,
    marginBottom: 2,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: "#E5E5E5",
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: Theme.colors.primary,
  },
  stepLabel: {
    fontSize: 14,
    color: Theme.colors.text.gray,
  },
  stepLabelActive: {
    color: Theme.colors.black,
    fontWeight: "600",
  },
});

export default TrackingDetailsForm;