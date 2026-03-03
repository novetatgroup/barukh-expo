import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormikErrors, FormikTouched, FormikHandlers } from "formik";
import Theme from "@/app/constants/Theme";
import CustomDropdown from "../../../ui/Dropdown";
import { PackageFormValues } from "./types";
import { consignmentOptions, packageSizeOptions } from "./constants";

type PackageDetailsStepProps = {
  values: PackageFormValues;
  errors: FormikErrors<PackageFormValues>;
  touched: FormikTouched<PackageFormValues>;
  setFieldValue: (field: string, value: string | number | string[]) => void;
  handleChange: FormikHandlers["handleChange"];
};

const PackageDetailsStep: React.FC<PackageDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  handleChange,
}) => {
  return (
    <>
      {/* Allowed Items */}
      <Text style={[styles.sectionLabel, styles.firstSectionLabel]}>Select Allowed Items</Text>
      <CustomDropdown
        value={values.allowedCategories.length > 0 ? values.allowedCategories[0] : ""}
        options={consignmentOptions}
        onSelect={(value) => {
          const updated = values.allowedCategories.includes(value)
            ? values.allowedCategories
            : [...values.allowedCategories, value];
          setFieldValue("allowedCategories", updated);
        }}
        placeholder="Select Allowed Items"
      />

      {values.allowedCategories.length > 0 && (
        <View style={styles.tagsContainer}>
          {values.allowedCategories.map((category) => (
            <View key={category} style={styles.tag}>
              <Text style={styles.tagText}>{category}</Text>
              <TouchableOpacity
                onPress={() => {
                  const filtered = values.allowedCategories.filter((c) => c !== category);
                  setFieldValue("allowedCategories", filtered);
                }}
              >
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
            onPress={() => setFieldValue("maxWeightKg", option.value)}
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
          onChangeText={handleChange("maxHeightCm")}
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
          onChangeText={handleChange("maxWidthCm")}
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
          onChangeText={handleChange("maxLengthCm")}
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
