import Theme from "@/app/constants/Theme";
import { Formik } from "formik";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import * as Yup from "yup";
import CustomButton from "../../ui/CustomButton";
import CustomTextInput from "../../ui/CustomTextInput";
import PhoneNumberInput, { DEFAULT_COUNTRY, Country } from "../../ui/PhoneNumberInput";
import LocationPicker from "../../ui/LocationPicker";
import { LocationData } from "../traveller/packageForm/types";

type AddDetailsFormProps = {
    onSubmit: (data: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        emergencyContact: string;
        city: string;
        country: string;
    }) => void;
};

const ValidationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    emergencyContact: Yup.string().optional(),
    city: Yup.string().required("Location is required"),
    country: Yup.string().required("Location is required"),
});

const initialValues = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emergencyContact: "",
    city: "",
    country: "",
};

const AddDetailsForm: React.FC<AddDetailsFormProps> = ({
    onSubmit
}) => {
    const [loading, setLoading] = useState(false);
    const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [emergencyCountry, setEmergencyCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [location, setLocation] = useState<LocationData | null>(null);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Text style={styles.title}>Add Your
                <Text style={styles.titleBold}> Details</Text>
            </Text>
            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={async (values) => {
                    try {
                        setLoading(true);
                        const fullPhoneNumber = `${phoneCountry.dialCode}${values.phoneNumber}`;
                        const fullEmergencyContact = values.emergencyContact
                            ? `${emergencyCountry.dialCode}${values.emergencyContact}`
                            : "";
                        await onSubmit({
                            ...values,
                            phoneNumber: fullPhoneNumber,
                            emergencyContact: fullEmergencyContact,
                        });
                    } catch (error) {
                        console.error("Error submitting details:", error);
                    } finally {
                        setLoading(false);
                    }
                }}>{({
                    touched,
                    errors,
                    values,
                    handleChange,
                    handleSubmit,
                    setFieldValue
                }) => (
                    <>
                    <ScrollView
                        style={styles.formContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.inputLabel}>First Name</Text>
                        <CustomTextInput
                            value={values.firstName}
                            onChangeText={handleChange('firstName')}
                            variant="compact"
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && touched.firstName && (
                            <Text style={styles.errorText}>{errors.firstName}</Text>
                        )}

                        <Text style={styles.inputLabel}>Last Name</Text>
                        <CustomTextInput
                            value={values.lastName}
                            onChangeText={handleChange('lastName')}
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
                            onChangePhoneNumber={(phone) => setFieldValue('phoneNumber', phone)}
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
                            onChangePhoneNumber={(phone) => setFieldValue('emergencyContact', phone)}
                            selectedCountry={emergencyCountry}
                            onChangeCountry={setEmergencyCountry}
                            placeholder="Emergency contact number"
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title="Update Profile"
                            variant="primary"
                            onPress={() => handleSubmit()}
                            loading={loading}
                        />
                    </View>
                    </>
                )}
            </Formik>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background.secondary,
        paddingTop: Theme.spacing.xl,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: Theme.spacing.md,
    },
    title: {
        marginTop: Theme.spacing.lg,
        fontSize: 32,
        fontWeight: "400",
        color: Theme.colors.primary,
        marginBottom: Theme.spacing.md,
        lineHeight: 36,
        textAlign: "left",
        paddingHorizontal: Theme.spacing.md,
    },
    titleBold: {
        fontWeight: "700",
    },
    inputLabel: {
        ...Theme.typography.caption,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xs,
        fontWeight: '600',
    },
    errorText: {
        color: Theme.colors.error,
        fontSize: 12,
        marginTop: 4,
        marginBottom: 4,
    },
    buttonContainer: {
        paddingHorizontal: Theme.spacing.md,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xxl,
    },
});

export default AddDetailsForm;
