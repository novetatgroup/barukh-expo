import Theme from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../../ui/CustomButton";
import {
  DeliveryDetailsStep,
  initialFormValues,
  ItemDetailsStep,
  ShipmentFormValues,
  ShipmentSubmitData,
  Step1ValidationSchema,
  Step2ValidationSchema,
} from "./shipmentForm";

type CreateShipmentFormProps = {
  onSubmit: (data: ShipmentSubmitData) => void;
};

const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep1 = async (values: ShipmentFormValues) => {
    try {
      await Step1ValidationSchema.validate(values, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  };

  const handleFormSubmit = async (values: ShipmentFormValues) => {
    if (currentStep === 1) {
      const isValid = await validateStep1(values);
      if (isValid) {
        setCurrentStep(2);
      }
    } else {
      try {
        setLoading(true);
        const submitData: ShipmentSubmitData = {
          name: values.itemName,
          category: values.category,
          weightKg: Number(values.weightKg),
          lengthCm: Number(values.lengthCm),
          widthCm: Number(values.widthCm),
          heightCm: Number(values.heightCm),
          fragile: values.isFragile === "Yes",
          quantity: Number(values.quantity),
          originCountry: values.originCountry,
          originCity: values.originCity,
          ...(values.originLat && {
            originLat: values.originLat,
            originLon: values.originLon ?? undefined,
          }),
          destinationCountry: values.destinationCountry,
          destinationCity: values.destinationCity,
          ...(values.destinationLat && {
            destinationLat: values.destinationLat,
            destinationLon: values.destinationLon ?? undefined,
          }),
          urgencyLevel: Number(values.urgencyLevel),
          requiredByDate: values.requiredByDate,
          ...(values.photoUri ? { photoUri: values.photoUri } : {}),
        };
        await onSubmit(submitData);
      } catch (error) {
        console.error("Error submitting shipment details:", error);
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
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 1 ? "Item Details" : "Delivery Details"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, currentStep >= 1 && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>1</Text>
          </View>
          <Text style={styles.progressLabel}>Item Details</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, currentStep >= 2 && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Delivery Details</Text>
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
          <Formik<ShipmentFormValues>
            initialValues={initialFormValues}
            validationSchema={currentStep === 1 ? Step1ValidationSchema : Step2ValidationSchema}
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={handleFormSubmit}
          >
            {({ values, handleChange, handleSubmit, setFieldValue, errors, touched }) => (
              <View style={styles.formContainer}>
                {currentStep === 1 ? (
                  <ItemDetailsStep
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                  />
                ) : (
                  <DeliveryDetailsStep
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                  />
                )}

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
                      <Ionicons name="chevron-back" size={20} color={Theme.colors.primary} />
                      <Text style={styles.previousButtonText}>Previous</Text>
                    </TouchableOpacity>
                  )}
                  <CustomButton
                    title={currentStep === 1 ? "Next" : "Find Traveller"}
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
  keyboardAvoidingView: {
    flex: 1,
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
    flexDirection: "row",
    marginTop: Theme.spacing.xl,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    minHeight: Theme.components.button.height,
  },
  cancelButtonText: {
    fontSize: Theme.typography.body.fontSize,
    color: Theme.colors.primary,
    fontWeight: "500",
  },
  previousButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    minHeight: Theme.components.button.height,
  },
  previousButtonText: {
    fontSize: Theme.typography.body.fontSize,
    color: Theme.colors.primary,
    fontWeight: "500",
    marginLeft: Theme.spacing.xs,
  },
  submitButton: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },
});

export default CreateShipmentForm;
