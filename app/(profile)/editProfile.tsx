import { AuthContext } from "@/app/context/AuthContext";
import Theme from "@/app/constants/Theme";
import CustomButton from "@/app/components/ui/CustomButton";
import CustomTextInput from "@/app/components/ui/CustomTextInput";
import { userService, UserProfile } from "@/app/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  phoneNumber: Yup.string(),
  emergencyContact: Yup.string(),
});

const EditProfileScreen = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !accessToken) return;
      const { data, ok } = await userService.getUser(userId, accessToken);
      if (ok && data) {
        setUserProfile(data);
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
    <View style={styles.container}>
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
        }}
        validationSchema={ValidationSchema}
        onSubmit={async (values) => {
          if (!userId || !accessToken) return;
          const { ok, error } = await userService.updateProfile(userId, values, accessToken);
          if (ok) {
            Toast.success("Profile updated successfully!");
            router.back();
          } else {
            Toast.error(error || "Failed to update profile.");
          }
        }}
      >
        {({ touched, errors, values, handleChange, handleSubmit, isSubmitting }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <Text style={styles.inputLabel}>First Name</Text>
            <CustomTextInput
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              variant="compact"
            />
            {errors.firstName && touched.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <Text style={styles.inputLabel}>Last Name</Text>
            <CustomTextInput
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              variant="compact"
            />
            {errors.lastName && touched.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <CustomTextInput
              value={values.phoneNumber}
              onChangeText={handleChange("phoneNumber")}
              variant="compact"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <CustomTextInput
              value={values.emergencyContact}
              onChangeText={handleChange("emergencyContact")}
              variant="compact"
              keyboardType="phone-pad"
            />
            {errors.emergencyContact && touched.emergencyContact && (
              <Text style={styles.errorText}>{errors.emergencyContact}</Text>
            )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
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
    marginTop: -12,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: Theme.spacing.lg,
  },
});

export default EditProfileScreen;
