import Theme from "@/app/constants/Theme";
import { Formik } from "formik";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Yup from "yup";
import CustomButton from "../../ui/CustomButton";
import CustomTextInput from "../../ui/CustomTextInput";
import Divider from "../../ui/Divider";
import FooterLink from "../../ui/FooterLink";
import AuthScreenLayout from "./AuthScreenLayout";

type RegisterFormProps = {
  onSubmit: (data: { name: string; email: string }) => void;
  onGooglePress: () => void;
  onLoginPress: () => void;
  activeTab?: "login" | "register";
  onTabChange?: (tab: "login" | "register") => void;
};

const ValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short!")
    .max(50, "Name is too long!")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const initialValues = {
  name: "",
  email: "",
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onGooglePress,
  onLoginPress,
  activeTab,
  onTabChange,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <AuthScreenLayout
      title="Let's Get Started"
      subtitle="Sign up to start your journey."
      showTabSwitcher={!!activeTab && !!onTabChange}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ValidationSchema}
        onSubmit={async (values) => {
          try {
            setLoading(true);
            await onSubmit(values);
          } catch (error) {
            console.error("Error sending OTP:", error);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
          dirty,
        }) => (
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Name</Text>
            <CustomTextInput
              placeholder="Enter your name"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              autoCapitalize="words"
            />
            {errors.name && touched.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <Text style={styles.inputLabel}>Email</Text>
            <CustomTextInput
              placeholder="Enter your Email"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <CustomButton
              title="Sign up"
              variant="primary"
              onPress={() => handleSubmit()}
              style={styles.otpButton}
              disabled={isSubmitting || !isValid || !dirty}
              loading={loading}
            />

            <Divider text="Or" />

            <CustomButton
              title="Continue with Google"
              variant="google"
              onPress={onGooglePress}
              showGoogleIcon={true}
            />

            <FooterLink
              text="Already have an account?"
              linkText="Sign in"
              onLinkPress={onLoginPress}
            />
          </View>
        )}
      </Formik>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  formContent: {
    paddingBottom: 40, // Add bottom padding to ensure content is accessible above keyboard
  },
  inputLabel: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    paddingBottom: Theme.spacing.sm,
    color: Theme.colors.text.dark,
    fontWeight: "500",
  },
  otpButton: {
    height: Theme.components.button.height,
    marginTop: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default RegisterForm;
