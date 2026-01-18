import React, { useState } from "react";
import Theme from "@/app/constants/Theme";
import { Formik } from "formik";
import * as Yup from "yup";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import CustomButton from "../../ui/CustomButton";
import CustomDropdown from "../../ui/Dropdown";
import CustomTextInput from "../../ui/CustomTextInput";
import { ShipmentData } from "@/app/context/ShipmentContext";
import ProgressBar from "../../ui/ProgressBar";

type PackageDetailsFormProps = {
	initialValues?: Partial<ShipmentData>;
	onSubmit: (data: {
		allowedCategories: string[];
		maxWeightKg: number;
        maxHeightCm: number;
        maxWidthCm: number;
        maxLengthCm: number;
	}) => void;
};

const ValidationSchema = Yup.object().shape({
	allowedCategories: Yup.array().min(1, "Select at least one category"),
	maxWeightKg: Yup.number().required("Max weight is required").positive("Must be positive"),
    maxHeightCm: Yup.number().required("Max height is required").positive("Must be positive"),
    maxWidthCm: Yup.number().required("Max width is required").positive("Must be positive"),
    maxLengthCm: Yup.number().required("Max length is required").positive("Must be positive"),
});

const initialValues = {
	allowedCategories: [] as string[],
	maxWeightKg: "",
    maxHeightCm: "",
    maxWidthCm: "",
    maxLengthCm: "",
};

const allowedCategoriesOptions = [
	"Electronics",
	"Documents",
	"Clothing",
	"Food Items",
	"Fragile Items",
	"Books",
];

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
	onSubmit,
}) => {
	const [loading, setLoading] = useState(false);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Traveller Details</Text>
			<ProgressBar
				step={2}
				labels={["Traveller Details", "Package Details"]}
			/>

			<Formik
				initialValues={{ ...initialValues, ...initialValues }}
				validationSchema={ValidationSchema}
				onSubmit={async (values) => {
					try {
						setLoading(true);
						const submitData = {
							allowedCategories: values.allowedCategories,
							maxWeightKg: Number(values.maxWeightKg),
							maxHeightCm: Number(values.maxHeightCm),
							maxWidthCm: Number(values.maxWidthCm),
							maxLengthCm: Number(values.maxLengthCm),
						}
						await onSubmit(submitData);
					} catch (error) {
						console.error(
							"Error Submitting package details:",
							error
						);
					} finally {
						setLoading(false);
					}
				}}>
				{({ values, handleChange, handleSubmit, setFieldValue, errors,touched, }) => (
					<View style={styles.formContainer}>
						<Text style={styles.inputLabel}>
							Allowed Categories
						</Text>
						<CustomDropdown
							value=""
							options={allowedCategoriesOptions.filter(
								(opt) => !values.allowedCategories.includes(opt)
							)}
							onSelect={(value) => {
								const updated = [
									...values.allowedCategories,
									value,
								];
								setFieldValue("allowedCategories", updated);
							}}
							placeholder="Select category"
						/>

						<View style={styles.tagsContainer}>
							{values.allowedCategories.map((category) => (
								<View key={category} style={styles.tag}>
									<Text style={styles.tagText}>
										{category}
									</Text>
									<TouchableOpacity
										onPress={() => {
											const filtered =
												values.allowedCategories.filter(
													(c) => c !== category
												);
											setFieldValue(
												"allowedCategories",
												filtered
											);
										}}>
										<Text style={styles.tagRemove}>×</Text>
									</TouchableOpacity>
								</View>
							))}
						</View>

						
						 <Text style={styles.sectionTitle}>Maximum Package Dimensions</Text>

                            <Text style={styles.inputLabel}>Weight (kg)</Text>
                            <CustomTextInput
                                value={values.maxWeightKg}
                                onChangeText={handleChange('maxWeightKg')}
                                placeholder='Max weight in kg'
                                keyboardType='numeric'
                            />
                            {touched.maxWeightKg && errors.maxWeightKg && (
                                <Text style={styles.errorText}>{errors.maxWeightKg}</Text>
                            )}

                            <View style={styles.rowContainer}>
                                <View style={styles.dimensionInput}>
                                    <Text style={styles.inputLabel}>Height (cm)</Text>
                                    <CustomTextInput
                                        value={values.maxHeightCm}
                                        onChangeText={handleChange('maxHeightCm')}
                                        placeholder='Height'
                                        keyboardType='numeric'
                                    />
                                    {touched.maxHeightCm && errors.maxHeightCm && (
                                        <Text style={styles.errorText}>{errors.maxHeightCm}</Text>
                                    )}
                                </View>

                                <View style={styles.dimensionInput}>
                                    <Text style={styles.inputLabel}>Width (cm)</Text>
                                    <CustomTextInput
                                        value={values.maxWidthCm}
                                        onChangeText={handleChange('maxWidthCm')}
                                        placeholder='Width'
                                        keyboardType='numeric'
                                    />
                                    {touched.maxWidthCm && errors.maxWidthCm && (
                                        <Text style={styles.errorText}>{errors.maxWidthCm}</Text>
                                    )}
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Length (cm)</Text>
                            <CustomTextInput
                                value={values.maxLengthCm}
                                onChangeText={handleChange('maxLengthCm')}
                                placeholder='Max length in cm'
                                keyboardType='numeric'
                            />
                            {touched.maxLengthCm && errors.maxLengthCm && (
                                <Text style={styles.errorText}>{errors.maxLengthCm}</Text>
                            )}

						<CustomButton
							title="Update Status"
							variant="primary"
							loading={loading}
							onPress={() => handleSubmit()}
						/>
					</View>
				)}
			</Formik>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.white,
	},
	title: {
		...Theme.typography.h2,
		color: Theme.colors.black,
		textAlign: "center",
		marginBottom: Theme.spacing.md,
		marginTop: Theme.spacing.xxxl,
	},
	formContainer: {
		flex: 1,
		paddingTop: Theme.spacing.lg,
		paddingHorizontal: Theme.spacing.lg,
	},
	inputLabel: {
		...Theme.typography.caption,
		padding: Theme.spacing.sm,
		color: "#595959",
		fontWeight: "600",
	},
	rowContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: Theme.spacing.md,
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginVertical: 8,
		gap: 8,
	},
	tag: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Theme.colors.green,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	tagText: {
		color: "#fff",
		fontSize: 13,
		marginRight: 6,
	},
	tagRemove: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	sectionTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.black,
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.sm,
        fontWeight: '700',
    },
	dimensionInput: {
        flex: 1,
    },
	 errorText: {
        fontSize: 12,
        color: Theme.colors.error,
        marginTop: -8,
        marginBottom: 12,
        marginLeft: Theme.spacing.xs,
    },
});

export default PackageDetailsForm;
