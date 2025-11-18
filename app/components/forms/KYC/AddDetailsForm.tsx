import Theme from "@/app/constants/Theme";
import { Formik } from "formik";
import React, { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from "react-native";
import * as Yup from "yup";
import CustomTextInput from "../../ui/CustomTextInput";
import CustomButton from "../../ui/CustomButton";
import CustomDropdown from "../../ui/Dropdown";
import KYCContext from "@/app/context/KYCContext";

const countries = [
    { label: 'KENYA', value: 'KE' },
    { label: 'UGANDA', value: 'UG' },
    { label: 'TANZANIA', value: 'TZ' },
];

type AddDetailsFormProps = {
    onSubmit: (data: {
        fullName: string;
        address1: string;
        address2: string;
        country: string;
        state: string;
        city: string;
        email: string;
        emergencyContact: string;
    }) => void;
};

const ValidationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full Name is required"),
    address1: Yup.string().required("Address is required"),
    address2: Yup.string().optional(),
    country: Yup.string().required("Country is required"),
    state: Yup.string().optional(),
    city: Yup.string().optional(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    emergencyContact: Yup.string().required("Emergency Contact is required"),
});

const initialValues = {
    fullName: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    email: "",
    emergencyContact: "",
};

const AddDetailsForm: React.FC<AddDetailsFormProps> = ({
    onSubmit
}) => {
    const [loading, setLoading] = useState(false);
    const {country, updateCountry} = useContext(KYCContext);

    const handleCountryChange = (selectedCountry: string) => {
    if (selectedCountry) {
      updateCountry(selectedCountry);
    }

  };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Your
                <Text style={styles.titleBold}> Details</Text>
            </Text>
            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={async (values) => {
                    try {
                        setLoading(true);
                        await onSubmit(values);
                    } catch (error) {
                        console.error("Error Submitting traveller details:", error);
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
                    <View style={styles.formContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Full Names</Text>
                            <CustomTextInput
                                value={values.fullName}
                                onChangeText={handleChange('fullName')}
                                variant="compact"
                            />
                            {errors.fullName && touched.fullName && (
                                <Text style={{ color: 'red' }}>{errors.fullName}</Text>
                            )}
                            

                            <Text style={styles.inputLabel}>Address</Text>

                            <Text style={styles.subInputLabel}>Nationality</Text>
                            <CustomDropdown
                                value={country || ""}
                                options={countries}
                                placeholder="Select a country..."
                                onSelect={(value) => {
                                    setFieldValue("country", value);
                                    handleCountryChange(value)}}
                                
                            />
                            {errors.country && touched.country && (
                                <Text style={{ color: 'red' }}>{errors.country}</Text>
                            )}

                            <Text style={styles.subInputLabel}>Address 1</Text>
                            <CustomTextInput
                                value={values.address1}
                                onChangeText={handleChange('address1')}
                                variant="compact"
                            />
                            {errors.address1 && touched.address1 && (
                                <Text style={{ color: 'red' }}>{errors.address1}</Text>
                            )}


                            <Text style={styles.subInputLabel}>Address 2</Text>
                            <CustomTextInput
                                value={values.address2}
                                onChangeText={handleChange('address2')}
                                variant="compact"
                            />
                            {errors.address2 && touched.address2 && (
                                <Text style={{ color: 'red' }}>{errors.address2}</Text>
                            )}

                            <Text style={styles.subInputLabel}>State</Text>
                            <CustomTextInput
                                value={values.state}
                                onChangeText={handleChange('state')}
                                variant="compact"
                            />
                            {errors.state && touched.state && ( 
                                <Text style={{ color: 'red' }}>{errors.state}</Text>
                            )}

                            <Text style={styles.subInputLabel}>City</Text>
                            <CustomTextInput
                                value={values.city}
                                onChangeText={handleChange('city')}
                                variant="compact"
                            />
                            {errors.city && touched.city && (
                                <Text style={{ color: 'red' }}>{errors.city}</Text>
                            )}


                            <Text style={styles.inputLabel}>Emergency Contact</Text>
                            <CustomTextInput
                                value={values.emergencyContact}
                                onChangeText={handleChange('emergencyContact')}
                                variant="compact"
                            />
                            {errors.emergencyContact && touched.emergencyContact && (
                                <Text style={{ color: 'red' }}>{errors.emergencyContact}</Text>
                            )}

                            <Text style={styles.inputLabel}>Email Address</Text>
                            <CustomTextInput
                                value={values.email}
                                onChangeText={handleChange('email')}
                                variant="compact"
                            />
                            {errors.email && touched.email && (
                                <Text style={{ color: 'red' }}>{errors.email}</Text>
                            )}

                                <CustomButton
                                    title="Add details"
                                    variant="primary"
                                    onPress={() => handleSubmit()}
                                    style={styles.sendButton}
                                    loading={loading}
                                />
                        </ScrollView>

                    </View>


                )}
            </Formik>
        </View>
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
        paddingHorizontal: Theme.spacing.xl,
    },
    title: {
        marginTop: Theme.spacing.lg,
        fontSize: 32,
        fontWeight: "400",
        color: Theme.colors.primary,
        marginBottom: Theme.spacing.md,
        lineHeight: 36,
        textAlign: "left",
        paddingHorizontal: Theme.spacing.xl,
    },
    titleBold: {
        fontWeight: "700",
    },
    inputLabel: {
        ...Theme.typography.caption,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xs,
        paddingHorizontal: 0,
        fontWeight: '600',
    },
    subInputLabel: {
        ...Theme.typography.caption,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xs,
        paddingHorizontal: 0,
        fontWeight: '400',

    },
    submitButton: {
        backgroundColor: "#1A3A3A",
        borderRadius: 25,
        paddingVertical: Theme.spacing.md,
        marginTop: Theme.spacing.xl,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: Theme.colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    sendButton: {

        marginTop: Theme.spacing.md,
    },
})
export default AddDetailsForm;