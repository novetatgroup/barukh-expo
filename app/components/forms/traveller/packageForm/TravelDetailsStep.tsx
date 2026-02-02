import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormikErrors, FormikTouched, FormikHandlers } from "formik";
import DateTimePicker from "@react-native-community/datetimepicker";
import Theme from "@/app/constants/Theme";
import CustomDropdown from "../../../ui/Dropdown";
import { PackageFormValues } from "./types";
import { countryOptions, getCitiesByCountry, modeOptions } from "./constants";

type TravelDetailsStepProps = {
  values: PackageFormValues;
  errors: FormikErrors<PackageFormValues>;
  touched: FormikTouched<PackageFormValues>;
  setFieldValue: (field: string, value: string) => void;
  handleChange: FormikHandlers["handleChange"];
};

const TravelDetailsStep: React.FC<TravelDetailsStepProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
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

  return (
    <>
      {/* Origin */}
      <Text style={styles.sectionLabel}>Origin</Text>
      <CustomDropdown
        value={values.originCountry}
        options={countryOptions}
        onSelect={(value) => {
          setFieldValue("originCountry", value);
          setFieldValue("originCity", "");
        }}
        placeholder="Select Country"
      />
      {touched.originCountry && errors.originCountry && (
        <Text style={styles.errorText}>{errors.originCountry}</Text>
      )}

      <CustomDropdown
        value={values.originCity}
        options={getCitiesByCountry(values.originCountry)}
        onSelect={(value) => setFieldValue("originCity", value)}
        placeholder="Select City"
        disabled={!values.originCountry}
      />
      {touched.originCity && errors.originCity && (
        <Text style={styles.errorText}>{errors.originCity}</Text>
      )}

      {/* Destination */}
      <Text style={styles.sectionLabel}>Destination</Text>
      <CustomDropdown
        value={values.destinationCountry}
        options={countryOptions}
        onSelect={(value) => {
          setFieldValue("destinationCountry", value);
          setFieldValue("destinationCity", "");
        }}
        placeholder="Select Country"
      />
      {touched.destinationCountry && errors.destinationCountry && (
        <Text style={styles.errorText}>{errors.destinationCountry}</Text>
      )}

      <CustomDropdown
        value={values.destinationCity}
        options={getCitiesByCountry(values.destinationCountry)}
        onSelect={(value) => setFieldValue("destinationCity", value)}
        placeholder="Select City"
        disabled={!values.destinationCountry}
      />
      {touched.destinationCity && errors.destinationCity && (
        <Text style={styles.errorText}>{errors.destinationCity}</Text>
      )}

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
        <Ionicons name="calendar-outline" size={20} color={Theme.colors.text.gray} />
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
                  setFieldValue("departureDate", formatted);
                }
              }}
              minimumDate={new Date()}
              textColor={Theme.colors.black}
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
                setFieldValue("departureDate", formatted);
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
        <Ionicons name="time-outline" size={20} color={Theme.colors.text.gray} />
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
                  setFieldValue("departureTime", formatted);
                }
              }}
              textColor={Theme.colors.black}
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
                setFieldValue("departureTime", formatted);
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
        <Ionicons name="calendar-outline" size={20} color={Theme.colors.text.gray} />
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
                  setFieldValue("arrivalDate", formatted);
                }
              }}
              minimumDate={values.departureDate ? new Date(values.departureDate) : new Date()}
              textColor={Theme.colors.black}
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
                setFieldValue("arrivalDate", formatted);
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
        <Ionicons name="time-outline" size={20} color={Theme.colors.text.gray} />
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
                  setFieldValue("arrivalTime", formatted);
                }
              }}
              textColor={Theme.colors.black}
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
                setFieldValue("arrivalTime", formatted);
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
          setFieldValue("mode", value);
          setFieldValue("flightNumber", "");
          setFieldValue("vehiclePlate", "");
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
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
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

export default TravelDetailsStep;
