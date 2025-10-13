import React from "react";
import Theme from "@/app/constants/Theme";
import { Formik } from "formik";
import * as Yup from "yup";
import {
    View,
    StyleSheet,
    Text,
} from "react-native";
import CustomButton from "../../ui/CustomButton";
import CustomDropdown from "../../ui/Dropdown";
import CustomTextInput from "../../ui/CustomTextInput";
import { ShipmentData } from "@/app/context/ShipmentContext";
import ProgressBar from "../../ui/ProgressBar";

type PackageDetailsFormProps = {
    initialValues?: Partial<ShipmentData>;
    onSubmit: (data: {
        allowedCategories: string[],
        weight: string;
        height: string;
        width: string;
    }) => void

}

const ValidationSchema = Yup.object().shape({
    allowedCategories: Yup.array().min(1, "Select at least one category"),
    weight: Yup.string().required("Weight is required"),
    height: Yup.string().required("Height is required"),
    width: Yup.string().required("Width is required"),
});

const initialValues = {
    allowedCategories: [],
    weight: "",
    height: "",
    width: "",
}

const allowedCategoriesOptions = [
    'Electronics',
    'Documents',
    'Clothing',
    'Food Items',
    'Fragile Items',
    'Books',

]

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
    onSubmit,

}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Traveller Details</Text>
            <ProgressBar step={2} labels={["Traveller Details", "Package Details"]} />

            <Formik
                initialValues={{ ...initialValues, ...initialValues }}
                validationSchema={ValidationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    console.log("Submitting from Traveller Details Form:", values);
                    onSubmit(values);
                    setSubmitting(false);
                }}>{({
                    values,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                }) => (
                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Allowed Categories</Text>
                        <CustomDropdown
                            value={values.allowedCategories}
                            options={allowedCategoriesOptions}
                            onSelect={(value) => setFieldValue('allowedCategories', [value])} 
                            placeholder="Select category"
                            showLabel={false}
                        />

                        <Text style={styles.inputLabel}>Weight</Text>
                        <CustomTextInput
                            value={values.weight}
                            onChangeText={handleChange('weight')}
                            variant="compact"
                            style={{ width: 120,  }}
                        />


                        <Text style={styles.inputLabel}>Dimensions</Text>
                        <View style={styles.rowContainer}>
                            <CustomTextInput
                                value={values.height}
                                variant="compact"
                                placeholder="Height"
                                onChangeText={handleChange('height')}
                                style={{ width: 120, marginRight:20}}

                            />
                            <CustomTextInput
                                value={values.width}
                                variant="compact"
                                placeholder="Width"
                                onChangeText={handleChange('width')}
                                style={{ width: 120 }}
                            />
                        </View>

                        <CustomButton
                            title="Update Status"
                            variant="primary"
                            onPress={() => handleSubmit()}
                        />
                    </View>


                )
                }

            </Formik>


        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
 title: {
        ...Theme.typography.h2,
        color: Theme.colors.black,
        textAlign: 'center',
        marginBottom: Theme.spacing.md,
        marginTop: Theme.spacing.xxxl,
    },
    formContainer: {
        flex: 1,
        paddingTop:Theme.spacing.lg,
        paddingHorizontal: Theme.spacing.lg,
      
    },
    inputLabel: {
        ...Theme.typography.caption,
        padding: Theme.spacing.sm,
        color: "#595959",
        fontWeight: '600',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.md,
    },
})

export default PackageDetailsForm;

