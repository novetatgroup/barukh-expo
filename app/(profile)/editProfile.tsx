import { AuthContext } from "@/app/context/AuthContext";
import Theme from "@/app/constants/Theme";
import CustomButton from "@/app/components/ui/CustomButton";
import CustomTextInput from "@/app/components/ui/CustomTextInput";
import PhoneNumberInput, { Country, DEFAULT_COUNTRY } from "@/app/components/ui/PhoneNumberInput";
import LocationPicker from "@/app/components/ui/LocationPicker";
import { LocationData } from "@/app/components/forms/traveller/packageForm/types";
import { userService, UserProfile } from "@/app/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import * as Yup from "yup";

const ValidationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  emergencyContact: Yup.string().optional(),
  city: Yup.string().required("Location is required"),
  country: Yup.string().required("Location is required"),
});

const EditProfileScreen = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [emergencyCountry, setEmergencyCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !accessToken) return;
      const { data, ok } = await userService.getUser(userId, accessToken);
      if (ok && data) {
        setUserProfile(data);
        if (data.city && data.country) {
          setLocation({
            placeId: "",
            description: `${data.city}, ${data.country}`,
            city: data.city,
            country: data.country,
            countryCode: "",
            latitude: 0,
            longitude: 0,
          });
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId, accessToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <Formik
        initialValues={{
          firstName: userProfile?.firstName || "",
          lastName: userProfile?.lastName || "",
          phoneNumber: userProfile?.phoneNumber || "",
          emergencyContact: userProfile?.emergencyContact || "",
          city: userProfile?.city || "",
          country: userProfile?.country || "",
        }}
        validationSchema={ValidationSchema}
        onSubmit={async (values) => {
          if (!userId || !accessToken) return;
          const fullPhoneNumber = `${phoneCountry.dialCode}${values.phoneNumber}`;
          const fullEmergencyContact = values.emergencyContact
            ? `${emergencyCountry.dialCode}${values.emergencyContact}`
            : "";
          const { ok, error } = await userService.updateProfile(
            userId,
            {
              ...values,
              phoneNumber: fullPhoneNumber,
              emergencyContact: fullEmergencyContact,
            },
            accessToken
          );
          if (ok) {
            Toast.success("Profile updated successfully!");
            router.back();
          } else {
            Toast.error(error || "Failed to update profile.");
          }
        }}
      >
        {({ touched, errors, values, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>First Name</Text>
            <CustomTextInput
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              variant="compact"
              placeholder="Enter your first name"
            />
            {errors.firstName && touched.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <Text style={styles.inputLabel}>Last Name</Text>
            <CustomTextInput
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              variant="compact"
              placeholder="Enter your last name"
            />
            {errors.lastName && touched.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <Text style={styles.inputLabel}>Location</Text>
            <LocationPicker
              placeholder="Search for your city..."
              value={location}
              onLocationSelect={(loc) => {
                setLocation(loc);
                if (loc) {
                  setFieldValue("city", loc.city);
                  setFieldValue("country", loc.country);
                } else {
                  setFieldValue("city", "");
                  setFieldValue("country", "");
                }
              }}
              error={
                (errors.city && touched.city) || (errors.country && touched.country)
                  ? "Please select a location"
                  : undefined
              }
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <PhoneNumberInput
              value={values.phoneNumber}
              onChangePhoneNumber={(phone) => setFieldValue("phoneNumber", phone)}
              selectedCountry={phoneCountry}
              onChangeCountry={setPhoneCountry}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            <Text style={styles.inputLabel}>Emergency Contact (Optional)</Text>
            <PhoneNumberInput
              value={values.emergencyContact}
              onChangePhoneNumber={(phone) => setFieldValue("emergencyContact", phone)}
              selectedCountry={emergencyCountry}
              onChangeCountry={setEmergencyCountry}
              placeholder="Emergency contact number"
            />

            <CustomButton
              title="Save Changes"
              variant="primary"
              onPress={() => handleSubmit()}
              style={styles.saveButton}
              loading={isSubmitting}
            />
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Theme.spacing.xxxxl,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    marginRight: Theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  formContent: {
    paddingBottom: 100,
  },
  inputLabel: {
    ...Theme.typography.caption,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
    fontWeight: "600",
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  saveButton: {
    marginTop: Theme.spacing.lg,
  },
});

export default EditProfileScreen;
