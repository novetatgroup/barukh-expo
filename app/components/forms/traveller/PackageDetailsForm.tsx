import Theme from "@/app/constants/Theme";
import { ShipmentData } from "@/app/context/ShipmentContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "../../ui/CustomButton";
import {
	initialFormValues,
	PackageDetailsStep,
	PackageFormValues,
	PackageSubmitData,
	Step1ValidationSchema,
	Step2ValidationSchema,
	TravelDetailsStep,
} from "./packageForm";

type PackageDetailsFormProps = {
  initialValues?: Partial<ShipmentData>;
  onSubmit: (data: PackageSubmitData) => void;
};

const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  }
  return date.toISOString();
};

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep1 = async (values: PackageFormValues) => {
    try {
      await Step1ValidationSchema.validate(values, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  };

  const handleFormSubmit = async (values: PackageFormValues) => {
    if (currentStep === 1) {
      const isValid = await validateStep1(values);
      if (isValid) {
        setCurrentStep(2);
      }
    } else {
      try {
        setLoading(true);
        const submitData: PackageSubmitData = {
          originCountry: values.originCountry,
          originCity: values.originCity,
          destinationCountry: values.destinationCountry,
          destinationCity: values.destinationCity,
          departureAt: combineDateAndTime(values.departureDate, values.departureTime),
          arrivalAt: combineDateAndTime(values.arrivalDate, values.arrivalTime),
          mode: values.mode,
          ...(values.mode === "FLIGHT" && { flightNumber: values.flightNumber }),
          ...(values.mode === "CAR" && { vehiclePlate: values.vehiclePlate }),
          allowedCategories: values.allowedCategories,
          maxWeightKg: Number(values.maxWeightKg),
          maxHeightCm: Number(values.maxHeightCm),
          maxWidthCm: Number(values.maxWidthCm),
          maxLengthCm: Number(values.maxLengthCm),
        };
        await onSubmit(submitData);
      } catch (error) {
        console.error("Error submitting package details:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 1 ? "Travel Details" : "Package Details"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, currentStep >= 1 && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>1</Text>
          </View>
          <Text style={styles.progressLabel}>Trip Details</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, currentStep >= 2 && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Package Details</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Formik<PackageFormValues>
          initialValues={{ ...initialFormValues, ...initialValues } as PackageFormValues}
          validationSchema={currentStep === 1 ? Step1ValidationSchema : Step2ValidationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleFormSubmit}
        >
          {({ values, handleChange, handleSubmit, setFieldValue, errors, touched }) => (
            <View style={styles.formContainer}>
              {currentStep === 1 ? (
                <TravelDetailsStep
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                />
              ) : (
                <PackageDetailsStep
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                />
              )}

              {/* Submit/Next Button */}
              <View style={styles.buttonContainer}>
                <CustomButton
                  title={currentStep === 1 ? "Next" : "Create Trip"}
                  variant="primary"
                  loading={loading}
                  onPress={() => handleSubmit()}
                  style={styles.submitButton}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.md,
    backgroundColor: "#F4F1F2",
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.black,
  },
  headerSpacer: {
    width: 32,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.text.border,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: {
    backgroundColor: Theme.colors.green,
  },
  progressDotText: {
    color: Theme.colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  progressLabel: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    color: Theme.colors.text.gray,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.text.border,
    marginHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  buttonContainer: {
    marginTop: Theme.spacing.xl,
  },
  submitButton: {
    borderRadius: Theme.borderRadius.md,
  },
});

export default PackageDetailsForm;
