import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { FormikErrors, FormikTouched, FormikHandlers } from "formik";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Theme from "@/constants/Theme";
import LocationPicker from "../../../ui/LocationPicker";
import CustomDropdown from "../../../ui/Dropdown";
import { ShipmentFormValues, LocationData } from "./types";
import { urgencyOptions } from "./constants";

type DeliveryDetailsStepProps = {
  values: ShipmentFormValues;
  errors: FormikErrors<ShipmentFormValues>;
  touched: FormikTouched<ShipmentFormValues>;
  setFieldValue: (field: string, value: any) => void;
  handleChange: FormikHandlers["handleChange"];
};

const DeliveryDetailsStep: React.FC<DeliveryDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Origin */}
      <View style={{ zIndex: 2 }}>
        <LocationPicker
          label="Sending from"
          placeholder="Search origin city..."
          value={values.origin}
          onLocationSelect={(location: LocationData | null) => {
            setFieldValue("origin", location);
            setFieldValue("originCountry", location?.countryCode || "");
            setFieldValue("originCity", location?.city || "");
            setFieldValue("originLat", location?.latitude || null);
            setFieldValue("originLon", location?.longitude || null);
          }}
          error={touched.origin && errors.origin ? String(errors.origin) : undefined}
        />
      </View>

      {/* Destination */}
      <View style={{ zIndex: 1 }}>
        <LocationPicker
          label="Sending to"
          placeholder="Search destination city..."
          value={values.destination}
          onLocationSelect={(location: LocationData | null) => {
            setFieldValue("destination", location);
            setFieldValue("destinationCountry", location?.countryCode || "");
            setFieldValue("destinationCity", location?.city || "");
            setFieldValue("destinationLat", location?.latitude || null);
            setFieldValue("destinationLon", location?.longitude || null);
          }}
          error={touched.destination && errors.destination ? String(errors.destination) : undefined}
        />
      </View>

      {/* Urgency Level */}
      <Text style={styles.sectionLabel}>Urgency Level</Text>
      <CustomDropdown
        value={values.urgencyLevel}
        options={urgencyOptions}
        onSelect={(value) => setFieldValue("urgencyLevel", value)}
        placeholder="Select urgency"
      />
      {touched.urgencyLevel && errors.urgencyLevel && (
        <Text style={styles.errorText}>{errors.urgencyLevel}</Text>
      )}

      {/* Required By Date */}
      <Text style={styles.sectionLabel}>Required By Date</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.datePickerText, !values.requiredByDate && styles.placeholderText]}>
          {values.requiredByDate ? formatDate(values.requiredByDate) : "Select Date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={Theme.colors.text.gray} />
      </TouchableOpacity>
      {touched.requiredByDate && errors.requiredByDate && (
        <Text style={styles.errorText}>{errors.requiredByDate}</Text>
      )}

      {showDatePicker && (
        Platform.OS === "ios" ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                  setFieldValue("requiredByDate", selectedDate.toISOString());
                }
              }}
              minimumDate={new Date()}
              textColor={Theme.colors.black}
            />
          </View>
        ) : (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === "set" && selectedDate) {
                setTempDate(selectedDate);
                setFieldValue("requiredByDate", selectedDate.toISOString());
              }
            }}
            minimumDate={new Date()}
          />
        )
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
  errorText: {
    fontSize: 12,
    color: Theme.colors.error,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: Theme.spacing.xs,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
  },
  datePickerText: {
    fontSize: 16,
    color: Theme.colors.text.dark,
  },
  placeholderText: {
    color: "#999",
  },
  pickerContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    marginTop: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.text.border,
    backgroundColor: "#F8F8F8",
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.green,
  },
});

export default DeliveryDetailsStep;
