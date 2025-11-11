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

type LoginFormProps = {
  onSubmit: (data: { email: string }) => void;
  onGooglePress: () => void;
  onRegisterPress: () => void;
  activeTab?: "login" | "register";
  onTabChange?: (tab: "login" | "register") => void;
};

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const initialValues = {
  email: "",
};

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onGooglePress,
  onRegisterPress,
  activeTab,
  onTabChange,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <AuthScreenLayout
      title="Welcome Back"
      subtitle="Login to continue your journey."
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
              title="Sign in"
              variant="primary"
              onPress={() => handleSubmit()}
              style={styles.otpButton}
              disabled={loading || isSubmitting || !isValid || !dirty}
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
              text="Don't have an account?"
              linkText="Sign up"
              onLinkPress={onRegisterPress}
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
    //height: Theme.components.button.height,
    marginTop: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginForm;
