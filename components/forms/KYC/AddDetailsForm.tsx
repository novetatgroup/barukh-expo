import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { UserProfile, userService } from "@/services/userService";
import { Formik } from "formik";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { Toast } from "toastify-react-native";
import * as Yup from "yup";
import CustomButton from "../../ui/CustomButton";
import CustomTextInput from "../../ui/CustomTextInput";
import LocationPicker from "../../ui/LocationPicker";
import PhoneNumberInput, { COUNTRIES, Country, DEFAULT_COUNTRY } from "../../ui/PhoneNumberInput";
import { LocationData } from "../traveller/packageForm/types";

type AddDetailsFormProps = {
    onSuccess: () => void;
    initialData?: UserProfile | null;
};

const ValidationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    emergencyContact: Yup.string().optional(),
    addressLineA: Yup.string().required("Address line A is required"),
    addressLineB: Yup.string().optional(),
    postalCode: Yup.string().optional(),
    city: Yup.string().required("City is required"),
    country: Yup.string().required("Country is required"),
});

function parsePhone(fullPhone: string): { country: Country; number: string } {
    if (!fullPhone) return { country: DEFAULT_COUNTRY, number: "" };
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const country of sorted) {
        if (fullPhone.startsWith(country.dialCode)) {
            return { country, number: fullPhone.slice(country.dialCode.length) };
        }
    }
    return { country: DEFAULT_COUNTRY, number: fullPhone };
}

const AddDetailsForm: React.FC<AddDetailsFormProps> = ({
    onSuccess,
    initialData,
}) => {
    const { userId, accessToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const parsedPhone = useMemo(() => parsePhone(initialData?.phoneNumber || ""), [initialData?.phoneNumber]);
    const parsedEmergency = useMemo(() => parsePhone(initialData?.emergencyContact || ""), [initialData?.emergencyContact]);

    const [phoneCountry, setPhoneCountry] = useState<Country>(parsedPhone.country);
    const [emergencyCountry, setEmergencyCountry] = useState<Country>(parsedEmergency.country);

    useEffect(() => {
        setPhoneCountry(parsedPhone.country);
    }, [parsedPhone.country]);

    useEffect(() => {
        setEmergencyCountry(parsedEmergency.country);
    }, [parsedEmergency.country]);

    const initialCityLocation = useMemo((): LocationData | null => {
        if (!initialData?.city) return null;
        return {
            placeId: "",
            description: initialData.city,
            city: initialData.city,
            country: "",
            countryCode: "",
            latitude: 0,
            longitude: 0,
        };
    }, [initialData?.city]);

    const initialCountryLocation = useMemo((): LocationData | null => {
        if (!initialData?.country) return null;
        return {
            placeId: "",
            description: initialData.country,
            city: "",
            country: initialData.country,
            countryCode: initialData.country,
            latitude: 0,
            longitude: 0,
        };
    }, [initialData?.country]);

    const [cityLocation, setCityLocation] = useState<LocationData | null>(initialCityLocation);
    const [countryLocation, setCountryLocation] = useState<LocationData | null>(initialCountryLocation);

    useEffect(() => {
        setCityLocation(initialCityLocation);
    }, [initialCityLocation]);

    useEffect(() => {
        setCountryLocation(initialCountryLocation);
    }, [initialCountryLocation]);

    const initialValues = useMemo(() => ({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        phoneNumber: parsedPhone.number,
        emergencyContact: parsedEmergency.number,
        addressLineA: initialData?.addressLineA || "",
        addressLineB: initialData?.addressLineB || "",
        postalCode: initialData?.postalCode || "",
        city: initialData?.city || "",
        country: initialData?.country || "",
    }), [initialData, parsedPhone.number, parsedEmergency.number]);

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
                enableReinitialize
                onSubmit={async (values) => {
                    if (!userId || !accessToken) return;
                    try {
                        setLoading(true);
                        console.log({values});

                        const fullPhoneNumber = `${phoneCountry.dialCode}${values.phoneNumber}`;
                        const fullEmergencyContact = values.emergencyContact
                            ? `${emergencyCountry.dialCode}${values.emergencyContact}`
                            : "";

                        const initialFullPhone = `${parsedPhone.country.dialCode}${initialValues.phoneNumber}`;
                        const initialFullEmergency = initialValues.emergencyContact
                            ? `${parsedEmergency.country.dialCode}${initialValues.emergencyContact}`
                            : "";

                        const payload: Partial<typeof initialValues & { phoneNumber: string; emergencyContact: string }> = {};

                        if (values.firstName !== initialValues.firstName) payload.firstName = values.firstName;
                        if (values.lastName !== initialValues.lastName) payload.lastName = values.lastName;
                        if (fullPhoneNumber !== initialFullPhone) payload.phoneNumber = fullPhoneNumber;
                        if (fullEmergencyContact !== initialFullEmergency) payload.emergencyContact = fullEmergencyContact;
                        if (values.addressLineA !== initialValues.addressLineA) payload.addressLineA = values.addressLineA;
                        if (values.addressLineB !== initialValues.addressLineB) payload.addressLineB = values.addressLineB;
                        if (values.postalCode !== initialValues.postalCode) payload.postalCode = values.postalCode;
                        if (values.city !== initialValues.city) payload.city = values.city;
                        if (values.country !== initialValues.country) payload.country = values.country;

                        if (Object.keys(payload).length === 0) {
                            Toast.info("No changes to save.");
                            return;
                        }

                        console.log("[AddDetailsForm] updateProfile payload:", payload);
                        const { ok, error } = await userService.updateProfile(userId, payload, accessToken);
                        if (ok) {
                            Toast.success("Details saved successfully!");
                            onSuccess();
                        } else {
                            console.error("[AddDetailsForm] updateProfile failed:", error);
                            Toast.error(error || "Failed to save details.");
                        }
                    } catch (err) {
                        console.error("[AddDetailsForm] updateProfile threw an exception:", err);
                        Toast.error("Something went wrong. Please try again.");
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

                        <Text style={styles.inputLabel}>Address Line A</Text>
                        <CustomTextInput
                            value={values.addressLineA}
                            onChangeText={handleChange('addressLineA')}
                            variant="compact"
                            placeholder="Street address"
                        />
                        {errors.addressLineA && touched.addressLineA && (
                            <Text style={styles.errorText}>{errors.addressLineA}</Text>
                        )}

                        <Text style={styles.inputLabel}>Address Line B (Optional)</Text>
                        <CustomTextInput
                            value={values.addressLineB}
                            onChangeText={handleChange('addressLineB')}
                            variant="compact"
                            placeholder="Apartment, suite, unit, etc."
                        />

                        <View style={styles.cityPickerLayer}>
                            <Text style={styles.inputLabel}>City</Text>
                            <LocationPicker
                                placeholder="Search for your city..."
                                value={cityLocation}
                                zIndex={30}
                                onInputChange={(text) => {
                                    setFieldValue("city", text);
                                }}
                                onLocationSelect={(loc) => {
                                    setCityLocation(loc ? { ...loc, description: loc.city } : null);
                                    setFieldValue("city", loc?.city || loc?.description || "");
                                    if (loc?.country) {
                                        setCountryLocation({ ...loc, description: loc.country });
                                        setFieldValue("country", loc.country);
                                    }
                                }}
                                error={errors.city && touched.city ? errors.city : undefined}
                            />
                        </View>

                        <View style={styles.countryPickerLayer}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <LocationPicker
                                placeholder="Search for your country..."
                                value={countryLocation}
                                zIndex={20}
                                onInputChange={(text) => {
                                    setFieldValue("country", text);
                                }}
                                onLocationSelect={(loc) => {
                                    setCountryLocation(loc ? { ...loc, description: loc.country } : null);
                                    setFieldValue("country", loc?.country || loc?.description || "");
                                }}
                                error={errors.country && touched.country ? errors.country : undefined}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Postal Code</Text>
                        <CustomTextInput
                            value={values.postalCode}
                            onChangeText={handleChange('postalCode')}
                            variant="compact"
                            placeholder="Enter postal code"
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
        backgroundColor: "#f4f1f2",
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
    cityPickerLayer: {
        zIndex: 30,
        ...Platform.select({
            android: {
                elevation: 30,
            },
        }),
    },
    countryPickerLayer: {
        zIndex: 20,
        ...Platform.select({
            android: {
                elevation: 20,
            },
        }),
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
