import React from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { FormikErrors, FormikTouched, FormikHandlers } from "formik";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Theme from "@/constants/Theme";
import CustomDropdown from "../../../ui/Dropdown";
import { ShipmentFormValues } from "./types";
import { categoryOptions, fragileOptions } from "./constants";

type ItemDetailsStepProps = {
  values: ShipmentFormValues;
  errors: FormikErrors<ShipmentFormValues>;
  touched: FormikTouched<ShipmentFormValues>;
  setFieldValue: (field: string, value: any) => void;
  handleChange: FormikHandlers["handleChange"];
};

const ItemDetailsStep: React.FC<ItemDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  handleChange,
}) => {
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Access Required",
          "Please enable camera access in your device settings to take a photo.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFieldValue("photoUri", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to open camera. Please try again.");
    }
  };



  return (
    <>
      {/* Item Name */}
      <Text style={styles.sectionLabel}>What's the item?</Text>
      <TextInput
        style={styles.textInput}
        value={values.itemName}
        onChangeText={handleChange("itemName")}
        placeholder="e.g., Macbook Pro M1"
        placeholderTextColor="#999"
      />
      {touched.itemName && errors.itemName && (
        <Text style={styles.errorText}>{errors.itemName}</Text>
      )}

      {/* Category */}
      <Text style={styles.sectionLabel}>Category</Text>
      <CustomDropdown
        value={values.category}
        options={categoryOptions}
        onSelect={(value) => setFieldValue("category", value)}
        placeholder="Select category"
      />
      {touched.category && errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}

      {/* Dimensions */}
      <Text style={styles.sectionLabel}>Dimensions</Text>
      <View style={styles.dimensionsRow}>
        <View style={styles.dimensionField}>
          <Text style={styles.dimensionLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            value={values.weightKg}
            onChangeText={handleChange("weightKg")}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          {touched.weightKg && errors.weightKg && (
            <Text style={styles.errorText}>{errors.weightKg}</Text>
          )}
        </View>
        <View style={styles.dimensionField}>
          <Text style={styles.dimensionLabel}>Length (cm)</Text>
          <TextInput
            style={styles.textInput}
            value={values.lengthCm}
            onChangeText={handleChange("lengthCm")}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          {touched.lengthCm && errors.lengthCm && (
            <Text style={styles.errorText}>{errors.lengthCm}</Text>
          )}
        </View>
      </View>
      <View style={styles.dimensionsRow}>
        <View style={styles.dimensionField}>
          <Text style={styles.dimensionLabel}>Width (cm)</Text>
          <TextInput
            style={styles.textInput}
            value={values.widthCm}
            onChangeText={handleChange("widthCm")}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          {touched.widthCm && errors.widthCm && (
            <Text style={styles.errorText}>{errors.widthCm}</Text>
          )}
        </View>
        <View style={styles.dimensionField}>
          <Text style={styles.dimensionLabel}>Height (cm)</Text>
          <TextInput
            style={styles.textInput}
            value={values.heightCm}
            onChangeText={handleChange("heightCm")}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          {touched.heightCm && errors.heightCm && (
            <Text style={styles.errorText}>{errors.heightCm}</Text>
          )}
        </View>
      </View>

      {/* Is it fragile? */}
      <Text style={styles.sectionLabel}>Is it fragile?</Text>
      <CustomDropdown
        value={values.isFragile}
        options={fragileOptions}
        onSelect={(value) => setFieldValue("isFragile", value)}
        placeholder="Select"
      />
      {touched.isFragile && errors.isFragile && (
        <Text style={styles.errorText}>{errors.isFragile}</Text>
      )}

      {/* Quantity */}
      <Text style={styles.sectionLabel}>Quantity</Text>
      <TextInput
        style={styles.textInput}
        value={values.quantity}
        onChangeText={handleChange("quantity")}
        placeholder="1"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />
      {touched.quantity && errors.quantity && (
        <Text style={styles.errorText}>{errors.quantity}</Text>
      )}

      {/* Photo */}
      <Text style={styles.sectionLabel}>Item Photo</Text>
      {values.photoUri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: values.photoUri }} style={styles.photoPreview} />
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={() => setFieldValue("photoUri", "")}
          >
            <Ionicons name="close-circle" size={28} color={Theme.colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={20} color={Theme.colors.primary} />
          <Text style={styles.photoButtonText}>Open Camera & Take Photo</Text>
        </TouchableOpacity>
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
  errorText: {
    fontSize: 12,
    color: Theme.colors.error,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: Theme.spacing.xs,
  },
  dimensionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  dimensionField: {
    flex: 1,
  },
  dimensionLabel: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    marginBottom: 4,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 24,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: "#E8E8E8",
    marginBottom: Theme.spacing.lg,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.primary,
  },
  photoPreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Theme.colors.white,
    borderRadius: 14,
  },
});

export default ItemDetailsStep;
