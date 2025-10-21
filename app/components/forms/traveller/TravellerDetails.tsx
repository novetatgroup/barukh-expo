import Theme from '@/app/constants/Theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Yup from 'yup';
import CustomButton from '../../ui/CustomButton';
import CustomTextInput from '../../ui/CustomTextInput';
import CustomDropdown from '../../ui/Dropdown';
import ProgressBar from '../../ui/ProgressBar';

type TravellerDetailsFormProps = {
    onSubmit: (data: {
        departure: string,
        destination: string,
        date: string,
        time: string,
        modeOfTravel: string,
        spaceType: string;
        spaceNumber: string;
    }) => void;
}

const ValidationSchema = Yup.object().shape({
    departure: Yup.string().required("Required"),
    destination: Yup.string().required("Destination is required"),
    date: Yup.string().required("Date is required"),
    time: Yup.string().required("Time is required"),
    modeOfTravel: Yup.string().required("Mode of travel is required"),
    spaceType: Yup.string().required("Required"),
    spaceNumber: Yup.string().required("Enter the number of spaces available"),

});

const initialValues = {
    departure: "",
    destination: "",
    date: "",
    time: "",
    modeOfTravel: "",
    spaceType: "",
    spaceNumber: "",
};

const cities = [
    'Nairobi',
    'Dodoma',
    'Nairobi',
    'Dodoma',
    'Nairobi',
    'Dodoma',
]

const modes = [
    'Flight',
    'Car',
]

const spaceTypes = [
    "Package Space",
    "Seats Available",
]

const TravellerDetailsForm: React.FC<TravellerDetailsFormProps> = ({
    onSubmit,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Traveller Details</Text>
            <ProgressBar step={1} labels={["Destination", "What to Carry"]} />

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
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                }) => (
                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Departure</Text>
                        <CustomDropdown
                            value={values.departure}
                            options={cities}
                            onSelect={(value) => setFieldValue('departure', value)}
                            showLabel={false}
                        />
                        {touched.departure && errors.departure && (
                            <Text style={styles.errorText}>{errors.departure}</Text>
                        )}

                        <Text style={styles.inputLabel}>Destination</Text>
                        <CustomDropdown
                            value={values.destination}
                            options={cities}
                            onSelect={(value) => setFieldValue('destination', value)}
                            showLabel={false}
                        />
                        {touched.destination && errors.destination && (
                            <Text style={styles.errorText}>{errors.destination}</Text>
                        )}



                        <Text style={styles.inputLabel}>Date/Time</Text>
                        <View style={styles.rowContainer}>

                            <View style={styles.inputWrapper}>
                                <TouchableOpacity
                                    style={styles.datePicker}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={[styles.dateText, !values.date && styles.placeholderText]}>
                                        {values.date ? values.date : 'Date'}
                                    </Text>
                                </TouchableOpacity>
                                {touched.date && errors.date && (
                                    <Text style={styles.errorText}>{errors.date}</Text>
                                )}
                            </View>

                            <View style={styles.inputWrapper}>
                                <TouchableOpacity
                                    style={styles.datePicker}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={[styles.dateText, !values.time && styles.placeholderText]}>
                                        {values.time ? values.time : 'Time'}
                                    </Text>
                                </TouchableOpacity>
                                {touched.time && errors.time && (
                                    <Text style={styles.errorText}>{errors.time}</Text>
                                )}
                            </View>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    if (Platform.OS === 'android') setShowDatePicker(false);
                                    if (event.type === 'set' && selectedDate) {
                                        const formatted = selectedDate.toISOString().split('T')[0];
                                        setTempDate(selectedDate);
                                        setFieldValue('date', formatted);
                                    }
                                }}
                                minimumDate={new Date()}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedTime) => {
                                    if (Platform.OS === 'android') setShowTimePicker(false);
                                    if (event.type === 'set' && selectedTime) {
                                        const formatted = selectedTime.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        });
                                        setTempTime(selectedTime);
                                        setFieldValue('time', formatted);
                                    }
                                }}
                            />
                        )}



                        <Text style={styles.inputLabel}>Mode Of Travel</Text>
                        <CustomDropdown
                            value={values.modeOfTravel}
                            options={modes}
                            onSelect={(value) => setFieldValue('modeOfTravel', value)}
                            showLabel={false}
                        />
                        {touched.modeOfTravel && errors.modeOfTravel && (
                            <Text style={styles.errorText}>{errors.modeOfTravel}</Text>
                        )}

                        <Text style={styles.inputLabel}>Space Available</Text>
                        <View style={styles.rowContainer}>
                            <CustomDropdown
                                value={values.spaceType}
                                options={spaceTypes}
                                onSelect={(value) => setFieldValue('spaceType', value)}
                                placeholder="Select space type"
                                showLabel={false}

                            />
                            {touched.spaceType && errors.spaceType && (
                                <Text style={styles.errorText}>{errors.spaceType}</Text>
                            )}


                            <CustomTextInput
                                value={values.spaceNumber}
                                onChangeText={handleChange('spaceNumber')}
                                variant="compact"
                                placeholder='No of spaces'
                                style={{ width: 120, height: 50, marginLeft: 20 }}
                            />
                        </View>

                        <CustomButton
                            title="Continue"
                            variant="primary"
                            loading={loading}
                            onPress={() => handleSubmit()}
                        />
                    </View>
                )}
            </Formik>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    formContainer: {
        flex: 1,
        paddingTop: Theme.spacing.lg,
        paddingHorizontal: Theme.spacing.xl,
    },
    title: {
        ...Theme.typography.h2,
        color: Theme.colors.black,
        textAlign: 'center',
        marginBottom: Theme.spacing.md,
        marginTop: Theme.spacing.xxxl,
    },
    caption: {
        ...Theme.typography.caption,
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

    inputWrapper: {
        flex: 1,
        borderColor: Theme.colors.black,

    },

    datePicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1.2,
        borderColor: Theme.colors.text.light,
        borderRadius: 10,
        backgroundColor: Theme.colors.white,
    },
    dateText: {
        color: Theme.colors.text.dark,
        fontSize: 14,
    },
    placeholderText: {
        color: Theme.colors.text.gray,
    },
    dateIcon: {
        fontSize: 18,
    },
    errorText: {
        fontSize: 12,
        color: Theme.colors.error,
        marginTop: -8,
        marginBottom: 12,
        marginLeft: Theme.spacing.xs,
    },
})

export default TravellerDetailsForm;