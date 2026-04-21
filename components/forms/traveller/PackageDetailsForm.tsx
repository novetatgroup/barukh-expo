import AppTheme from "@/constants/Theme";
import { ShipmentData } from "@/context/ShipmentContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "../../ui/CustomButton";
import {
  initialFormValues,
  LocationData,
  PackageDetailsStep,
  PackageFormValues,
  PackageSubmitData,
  Step1ValidationSchema,
  Step2ValidationSchema,
  TravelDetailsStep,
} from "./packageForm";

type PackageFormInitialValues = Partial<ShipmentData> & Partial<PackageFormValues>;

type PackageDetailsFormProps = {
  initialValues?: PackageFormInitialValues;
  onSubmit: (data: PackageSubmitData) => Promise<void>;
  isSubmitting?: boolean;
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

const toDateField = (value?: string): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
};

const toTimeField = (value?: string): string => {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const toLocationValue = (
  city?: string,
  country?: string,
  latitude?: number,
  longitude?: number,
): LocationData | null => {
  if (!city && !country) {
    return null;
  }

  const description = [city, country].filter(Boolean).join(", ");

  return {
    placeId: description || "saved-location",
    description,
    city: city || "",
    country: country || "",
    countryCode: country || "",
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
  };
};

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
  onSubmit,
  initialValues,
  isSubmitting,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const normalizedInitialValues: PackageFormValues = {
    ...initialFormValues,
    ...initialValues,
    origin:
      initialValues?.origin ??
      toLocationValue(
        initialValues?.originCity,
        initialValues?.originCountry,
        initialValues?.originLatitude ?? undefined,
        initialValues?.originLongitude ?? undefined,
      ),
    destination:
      initialValues?.destination ??
      toLocationValue(
        initialValues?.destinationCity,
        initialValues?.destinationCountry,
        initialValues?.destinationLatitude ?? undefined,
        initialValues?.destinationLongitude ?? undefined,
      ),
    departureDate:
      initialValues?.departureDate || toDateField(initialValues?.departureAt),
    departureTime:
      initialValues?.departureTime || toTimeField(initialValues?.departureAt),
    arrivalDate:
      initialValues?.arrivalDate || toDateField(initialValues?.arrivalAt),
    arrivalTime:
      initialValues?.arrivalTime || toTimeField(initialValues?.arrivalAt),
  };

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
          ...(values.originLatitude && {
            originLatitude: values.originLatitude,
            originLongitude: values.originLongitude ?? undefined,
          }),
          ...(values.destinationLatitude && {
            destinationLatitude: values.destinationLatitude,
            destinationLongitude: values.destinationLongitude ?? undefined,
          }),
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

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={AppTheme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 1 ? "Travel Details" : "Package Details"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

   
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik<PackageFormValues>
            initialValues={normalizedInitialValues}
            validationSchema={currentStep === 1 ? Step1ValidationSchema : Step2ValidationSchema}
            enableReinitialize
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={handleFormSubmit}
          >
            {({ values, handleChange, handleSubmit, setFieldValue, setFieldTouched, errors, touched }) => (
              <View style={styles.formContainer}>
                {currentStep === 1 ? (
                  <TravelDetailsStep
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
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

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                  {currentStep === 1 ? (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => router.back()}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.previousButton}
                      onPress={() => setCurrentStep(1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={AppTheme.colors.primary} />
                      <Text style={styles.previousButtonText}>Previous</Text>
                    </TouchableOpacity>
                  )}
                  <CustomButton
                    title={currentStep === 1 ? "Next" : "Create Trip"}
                    variant="primary"
                    loading={loading || isSubmitting}
                    onPress={() => handleSubmit()}
                    style={styles.submitButton}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.xxxl,
    paddingBottom: AppTheme.spacing.md,
    backgroundColor: "#F4F1F2",
  },
  backButton: {
    padding: AppTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppTheme.colors.black,
  },
  headerSpacer: {
    width: 32,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: AppTheme.spacing.md,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.text.border,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: {
    backgroundColor: AppTheme.colors.green,
  },
  progressDotText: {
    color: AppTheme.colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  progressLabel: {
    marginTop: AppTheme.spacing.xs,
    fontSize: 12,
    color: AppTheme.colors.text.gray,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: AppTheme.colors.text.border,
    marginHorizontal: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.lg,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xxl,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: AppTheme.spacing.xl,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.xl,
    minHeight: AppTheme.components.button.height,
  },
  cancelButtonText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: "500",
  },
  previousButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.xl,
    minHeight: AppTheme.components.button.height,
  },
  previousButtonText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: "500",
    marginLeft: AppTheme.spacing.xs,
  },
  submitButton: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },
});

export default PackageDetailsForm;
