import AppTheme from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomDropdown from "../../../ui/Dropdown";
import LocationPicker from "../../../ui/LocationPicker";
import { modeOptions } from "./constants";
import { LocationData, PackageFormValues } from "./types";

type TravelDetailsStepProps = {
  values: PackageFormValues;
  errors: FormikErrors<PackageFormValues>;
  touched: FormikTouched<PackageFormValues>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<unknown> | void;
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => Promise<unknown> | void;
  handleChange: FormikHandlers["handleChange"];
};

const TravelDetailsStep: React.FC<TravelDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  handleChange,
}) => {
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  const [tempDepartureDate, setTempDepartureDate] = useState(new Date());
  const [tempDepartureTime, setTempDepartureTime] = useState(new Date());
  const [tempArrivalDate, setTempArrivalDate] = useState(new Date());
  const [tempArrivalTime, setTempArrivalTime] = useState(new Date());

  const closeAllPickers = () => {
    setShowDepartureDatePicker(false);
    setShowDepartureTimePicker(false);
    setShowArrivalDatePicker(false);
    setShowArrivalTimePicker(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateField = async (
    field: keyof PackageFormValues,
    value: PackageFormValues[keyof PackageFormValues],
  ) => {
    await setFieldValue(field, value, true);
    await setFieldTouched(field, true, false);
  };

  const updateLocation = async (
    field: "origin" | "destination",
    location: LocationData | null,
  ) => {
    const countryField = field === "origin" ? "originCountry" : "destinationCountry";
    const cityField = field === "origin" ? "originCity" : "destinationCity";
    const latitudeField = field === "origin" ? "originLatitude" : "destinationLatitude";
    const longitudeField = field === "origin" ? "originLongitude" : "destinationLongitude";

    await setFieldValue(countryField, location?.countryCode || location?.country || "", false);
    await setFieldValue(cityField, location?.city || "", false);
    await setFieldValue(latitudeField, location?.latitude ?? null, false);
    await setFieldValue(longitudeField, location?.longitude ?? null, false);
    await setFieldValue(field, location, true);
    await setFieldTouched(field, true, false);
  };

  return (
    <>
      {/* Origin */}
      <View style={{ zIndex: 2 }}>
        <LocationPicker
          label="Origin"
          placeholder="Search origin city..."
          value={values.origin}
          onLocationSelect={(location: LocationData | null) => {
            void updateLocation("origin", location);
          }}
          error={touched.origin && errors.origin ? String(errors.origin) : undefined}
        />
      </View>

      {/* Destination */}
      <View style={{ zIndex: 1 }}>
        <LocationPicker
          label="Destination"
          placeholder="Search destination city..."
          value={values.destination}
          onLocationSelect={(location: LocationData | null) => {
            void updateLocation("destination", location);
          }}
          error={touched.destination && errors.destination ? String(errors.destination) : undefined}
        />
      </View>

      {/* Departure Date */}
      <Text style={styles.sectionLabel}>Departure Date</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => {
          closeAllPickers();
          setShowDepartureDatePicker(true);
        }}
      >
        <Text style={[styles.datePickerText, !values.departureDate && styles.placeholderText]}>
          {values.departureDate ? formatDate(values.departureDate) : "Select Date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={AppTheme.colors.text.gray} />
      </TouchableOpacity>
      {touched.departureDate && errors.departureDate && (
        <Text style={styles.errorText}>{errors.departureDate}</Text>
      )}

      {showDepartureDatePicker && (
        Platform.OS === "ios" ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDepartureDatePicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDepartureDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  const formatted = selectedDate.toISOString().split("T")[0];
                  setTempDepartureDate(selectedDate);
                  void updateField("departureDate", formatted);
                }
              }}
              minimumDate={new Date()}
              textColor={AppTheme.colors.black}
            />
          </View>
        ) : (
          <DateTimePicker
            value={tempDepartureDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDepartureDatePicker(false);
              if (event.type === "set" && selectedDate) {
                const formatted = selectedDate.toISOString().split("T")[0];
                setTempDepartureDate(selectedDate);
                void updateField("departureDate", formatted);
              }
            }}
            minimumDate={new Date()}
          />
        )
      )}

      {/* Departure Time */}
      <Text style={styles.sectionLabel}>Departure Time</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => {
          closeAllPickers();
          setShowDepartureTimePicker(true);
        }}
      >
        <Text style={[styles.datePickerText, !values.departureTime && styles.placeholderText]}>
          {values.departureTime || "Select Time"}
        </Text>
        <Ionicons name="time-outline" size={20} color={AppTheme.colors.text.gray} />
      </TouchableOpacity>
      {touched.departureTime && errors.departureTime && (
        <Text style={styles.errorText}>{errors.departureTime}</Text>
      )}

      {showDepartureTimePicker && (
        Platform.OS === "ios" ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDepartureTimePicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDepartureTime}
              mode="time"
              display="spinner"
              onChange={(_, selectedTime) => {
                if (selectedTime) {
                  const formatted = selectedTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  setTempDepartureTime(selectedTime);
                  void updateField("departureTime", formatted);
                }
              }}
              textColor={AppTheme.colors.black}
            />
          </View>
        ) : (
          <DateTimePicker
            value={tempDepartureTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowDepartureTimePicker(false);
              if (event.type === "set" && selectedTime) {
                const formatted = selectedTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                setTempDepartureTime(selectedTime);
                void updateField("departureTime", formatted);
              }
            }}
          />
        )
      )}

      {/* Arrival Date */}
      <Text style={styles.sectionLabel}>Arrival Date</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => {
          closeAllPickers();
          setShowArrivalDatePicker(true);
        }}
      >
        <Text style={[styles.datePickerText, !values.arrivalDate && styles.placeholderText]}>
          {values.arrivalDate ? formatDate(values.arrivalDate) : "Select Date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={AppTheme.colors.text.gray} />
      </TouchableOpacity>
      {touched.arrivalDate && errors.arrivalDate && (
        <Text style={styles.errorText}>{errors.arrivalDate}</Text>
      )}

      {showArrivalDatePicker && (
        Platform.OS === "ios" ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowArrivalDatePicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempArrivalDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  const formatted = selectedDate.toISOString().split("T")[0];
                  setTempArrivalDate(selectedDate);
                  void updateField("arrivalDate", formatted);
                }
              }}
              minimumDate={values.departureDate ? new Date(values.departureDate) : new Date()}
              textColor={AppTheme.colors.black}
            />
          </View>
        ) : (
          <DateTimePicker
            value={tempArrivalDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowArrivalDatePicker(false);
              if (event.type === "set" && selectedDate) {
                const formatted = selectedDate.toISOString().split("T")[0];
                setTempArrivalDate(selectedDate);
                void updateField("arrivalDate", formatted);
              }
            }}
            minimumDate={values.departureDate ? new Date(values.departureDate) : new Date()}
          />
        )
      )}

      {/* Arrival Time */}
      <Text style={styles.sectionLabel}>Arrival Time</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => {
          closeAllPickers();
          setShowArrivalTimePicker(true);
        }}
      >
        <Text style={[styles.datePickerText, !values.arrivalTime && styles.placeholderText]}>
          {values.arrivalTime || "Select Time"}
        </Text>
        <Ionicons name="time-outline" size={20} color={AppTheme.colors.text.gray} />
      </TouchableOpacity>
      {touched.arrivalTime && errors.arrivalTime && (
        <Text style={styles.errorText}>{errors.arrivalTime}</Text>
      )}

      {showArrivalTimePicker && (
        Platform.OS === "ios" ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowArrivalTimePicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempArrivalTime}
              mode="time"
              display="spinner"
              onChange={(_, selectedTime) => {
                if (selectedTime) {
                  const formatted = selectedTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  setTempArrivalTime(selectedTime);
                  void updateField("arrivalTime", formatted);
                }
              }}
              textColor={AppTheme.colors.black}
            />
          </View>
        ) : (
          <DateTimePicker
            value={tempArrivalTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowArrivalTimePicker(false);
              if (event.type === "set" && selectedTime) {
                const formatted = selectedTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                setTempArrivalTime(selectedTime);
                void updateField("arrivalTime", formatted);
              }
            }}
          />
        )
      )}

      {/* Mode of Transport */}
      <Text style={styles.sectionLabel}>Mode of Transport</Text>
      <CustomDropdown
        value={values.mode}
        options={modeOptions}
        onSelect={(value) => {
          void (async () => {
            await setFieldValue("flightNumber", "", false);
            await setFieldValue("vehiclePlate", "", false);
            await setFieldValue("mode", value, true);
            await setFieldTouched("mode", true, false);
          })();
        }}
        placeholder="Select Mode of Transport"
      />
      {touched.mode && errors.mode && <Text style={styles.errorText}>{errors.mode}</Text>}

      {values.mode === "FLIGHT" && (
        <>
          <Text style={styles.sectionLabel}>Flight Number</Text>
          <TextInput
            style={styles.textInput}
            value={values.flightNumber}
            onChangeText={handleChange("flightNumber")}
            placeholder="e.g., KQ415"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          {touched.flightNumber && errors.flightNumber && (
            <Text style={styles.errorText}>{errors.flightNumber}</Text>
          )}
        </>
      )}

      {values.mode === "CAR" && (
        <>
          <Text style={styles.sectionLabel}>Vehicle Plate</Text>
          <TextInput
            style={styles.textInput}
            value={values.vehiclePlate}
            onChangeText={handleChange("vehiclePlate")}
            placeholder="e.g., UAB 123X"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          {touched.vehiclePlate && errors.vehiclePlate && (
            <Text style={styles.errorText}>{errors.vehiclePlate}</Text>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppTheme.colors.black,
    marginBottom: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.md,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: AppTheme.colors.text.border,
    borderRadius: 8,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
  },
  datePickerText: {
    fontSize: 16,
    color: AppTheme.colors.text.dark,
  },
  placeholderText: {
    color: "#999",
  },
  textInput: {
    borderWidth: 1,
    borderColor: AppTheme.colors.text.border,
    borderRadius: 8,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    fontSize: 16,
    color: AppTheme.colors.text.dark,
    backgroundColor: AppTheme.colors.white,
  },
  errorText: {
    fontSize: 12,
    color: AppTheme.colors.error,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: AppTheme.spacing.xs,
  },
  pickerContainer: {
    backgroundColor: AppTheme.colors.white,
    borderRadius: 12,
    marginTop: AppTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.text.border,
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.text.border,
    backgroundColor: "#F8F8F8",
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppTheme.colors.green,
  },
});

export default TravelDetailsStep;
