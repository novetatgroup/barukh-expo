import CustomButton from "@/components/ui/CustomButton";
import CustomTextInput from "@/components/ui/CustomTextInput";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

const luhnCheck = (raw: string): boolean => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = parseInt(digits.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

const formatCardNumber = (raw: string) =>
  raw
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const ValidationSchema = Yup.object().shape({
  cardHolderName: Yup.string().trim().min(2, "Enter the name on the card").required("Required"),
  cardNumber: Yup.string()
    .required("Card number is required")
    .test("luhn", "Enter a valid card number", (value) => (value ? luhnCheck(value) : false)),
  expiry: Yup.string()
    .required("Expiry is required")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cvv: Yup.string()
    .required("CVV is required")
    .matches(/^\d{3,4}$/, "3 or 4 digits"),
});

const initialValues = {
  cardHolderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

const AddPaymentCardScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={25} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add payment card</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.helperText}>
          Card details are sent securely to Flutterwave. We only store the last 4 digits and the name on the card.
        </Text>

        <Formik
          initialValues={initialValues}
          validationSchema={ValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitError(null);
            if (!accessToken) {
              setSubmitError("Your session is unavailable. Please log in again.");
              setSubmitting(false);
              return;
            }

            const [expiryMonth, expiryYear] = values.expiry.split("/");
            const result = await paymentService.createPaymentCard(
              {
                cardHolderName: values.cardHolderName.trim(),
                cardNumber: values.cardNumber.replace(/\s/g, ""),
                expiryMonth,
                expiryYear,
                cvv: values.cvv,
              },
              accessToken,
            );
            setSubmitting(false);
            if (!result.ok) {
              setSubmitError(result.error || "Could not save the card. Please try again.");
              return;
            }
            router.back();
          }}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleSubmit,
            setFieldValue,
            isSubmitting,
            isValid,
            dirty,
          }) => (
            <View>
              <Text style={styles.label}>Name on card</Text>
              <CustomTextInput
                placeholder="John Doe"
                value={values.cardHolderName}
                onChangeText={(text) => setFieldValue("cardHolderName", text)}
                onBlur={handleBlur("cardHolderName")}
                autoCapitalize="words"
              />
              {errors.cardHolderName && touched.cardHolderName ? (
                <Text style={styles.errorText}>{errors.cardHolderName}</Text>
              ) : null}

              <Text style={styles.label}>Card number</Text>
              <CustomTextInput
                placeholder="1234 5678 9012 3456"
                value={values.cardNumber}
                onChangeText={(text) => setFieldValue("cardNumber", formatCardNumber(text))}
                onBlur={handleBlur("cardNumber")}
                keyboardType="number-pad"
              />
              {errors.cardNumber && touched.cardNumber ? (
                <Text style={styles.errorText}>{errors.cardNumber}</Text>
              ) : null}

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>Expiry (MM/YY)</Text>
                  <CustomTextInput
                    placeholder="09/32"
                    value={values.expiry}
                    onChangeText={(text) => setFieldValue("expiry", formatExpiry(text))}
                    onBlur={handleBlur("expiry")}
                    keyboardType="number-pad"
                  />
                  {errors.expiry && touched.expiry ? (
                    <Text style={styles.errorText}>{errors.expiry}</Text>
                  ) : null}
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>CVV</Text>
                  <CustomTextInput
                    placeholder="123"
                    value={values.cvv}
                    onChangeText={(text) => setFieldValue("cvv", text.replace(/\D/g, "").slice(0, 4))}
                    onBlur={handleBlur("cvv")}
                    keyboardType="number-pad"
                    secureTextEntry
                  />
                  {errors.cvv && touched.cvv ? (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  ) : null}
                </View>
              </View>

              {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

              <CustomButton
                title="Save card"
                variant="primary"
                onPress={() => handleSubmit()}
                disabled={isSubmitting || !isValid || !dirty}
                loading={isSubmitting}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "600",
    color: Theme.colors.text.dark,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  helperText: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "500",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default AddPaymentCardScreen;
