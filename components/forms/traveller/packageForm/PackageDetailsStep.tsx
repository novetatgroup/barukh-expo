import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { FormikErrors, FormikTouched } from "formik";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { packageSizeOptions } from "./constants";
import { PackageFormValues } from "./types";
import { TRIP_CATEGORY_OPTIONS, TripCategory } from "@/types/trip";

type PackageDetailsStepProps = {
  values: PackageFormValues;
  errors: FormikErrors<PackageFormValues>;
  touched: FormikTouched<PackageFormValues>;
  setFieldValue: (field: string, value: string | number | string[], shouldValidate?: boolean) => Promise<unknown> | void;
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => Promise<unknown> | void;
};

const PackageDetailsStep: React.FC<PackageDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
}) => {
  const updateField = async (
    field: keyof PackageFormValues,
    value: string | number | string[],
  ) => {
    await setFieldValue(field, value, true);
    await setFieldTouched(field, true, false);
  };

  return (
    <>
      <Text style={[styles.sectionLabel, styles.firstSectionLabel]}>Allowed package categories</Text>
      <Text style={styles.helperText}>Select every category you can carry.</Text>
      <View style={styles.categoryGrid}>
        {TRIP_CATEGORY_OPTIONS.map((option) => {
          const selected = values.allowedCategories.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.categoryPill, selected && styles.categoryPillSelected]}
              onPress={() => {
                const updated: TripCategory[] = selected
                  ? values.allowedCategories.filter((category) => category !== option.value)
                  : [...values.allowedCategories, option.value];
                void updateField("allowedCategories", updated);
              }}
            >
              <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {touched.allowedCategories && errors.allowedCategories && (
        <Text style={styles.errorText}>{errors.allowedCategories}</Text>
      )}

      {/* Package Size */}
      <Text style={styles.sectionLabel}>Package Size</Text>
      <View style={styles.packageSizeContainer}>
        {packageSizeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.packageSizeCard,
              values.maxWeightKg === option.value && styles.packageSizeCardSelected,
            ]}
            onPress={() => {
              void updateField("maxWeightKg", option.value);
            }}
          >
            <View style={styles.packageIconContainer}>
              <Ionicons
                name={option.icon}
                size={28}
                color={values.maxWeightKg === option.value ? Theme.colors.primary : Theme.colors.text.gray}
              />
            </View>
            <Text
              style={[
                styles.packageSizeLabel,
                values.maxWeightKg === option.value && styles.packageSizeLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {touched.maxWeightKg && errors.maxWeightKg && (
        <Text style={styles.errorText}>{errors.maxWeightKg}</Text>
      )}

      {/* Package Dimensions */}
      <Text style={styles.sectionLabel}>Package Dimensions</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Height (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={values.maxHeightCm}
          onChangeText={(value) => {
            void updateField("maxHeightCm", value);
          }}
          placeholder="Enter Height"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>
      {touched.maxHeightCm && errors.maxHeightCm && (
        <Text style={styles.errorText}>{errors.maxHeightCm}</Text>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Width (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={values.maxWidthCm}
          onChangeText={(value) => {
            void updateField("maxWidthCm", value);
          }}
          placeholder="Enter Width"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>
      {touched.maxWidthCm && errors.maxWidthCm && (
        <Text style={styles.errorText}>{errors.maxWidthCm}</Text>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Length (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={values.maxLengthCm}
          onChangeText={(value) => {
            void updateField("maxLengthCm", value);
          }}
          placeholder="Enter Length"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>
      {touched.maxLengthCm && errors.maxLengthCm && (
        <Text style={styles.errorText}>{errors.maxLengthCm}</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  firstSectionLabel: {
    marginTop: 0,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.background.border,
  },
  categoryPillSelected: {
    backgroundColor: Theme.colors.yellow,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  categoryTextSelected: {
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  inputContainer: {
    marginBottom: Theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.text.dark,
    backgroundColor: Theme.colors.white,
  },
  packageSizeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Theme.spacing.sm,
  },
  packageSizeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.white,
  },
  packageSizeCardSelected: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  packageIconContainer: {
    marginBottom: Theme.spacing.xs,
  },
  packageSizeLabel: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  packageSizeLabelSelected: {
    color: Theme.colors.primary,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    marginRight: 6,
  },
  tagRemove: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: Theme.spacing.xs,
  },
});

export default PackageDetailsStep;
