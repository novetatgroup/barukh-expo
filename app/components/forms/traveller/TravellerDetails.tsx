import Theme from '@/app/constants/Theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import * as Yup from 'yup';
import CustomButton from '../../ui/CustomButton';
import CustomTextInput from '../../ui/CustomTextInput';
import CustomDropdown from '../../ui/Dropdown';
import ProgressBar from '../../ui/ProgressBar';

type TravellerDetailsFormProps = {
    onSubmit: (data: {
        userId: number;
        originCountry: string;
        originCity: string;
        destinationCountry: string;
        destinationCity: string;
        // date: string;
        // time: string;
        departureAt: string;
        arrivalAt: string;
        arrivalDate: string;
        departureDate:string;
        mode: string;
        spaceType: string;
        spaceNumber: string;
        flightNumber?: string;
        vehiclePlate?: string;
    }) => void;
}

const ValidationSchema = Yup.object().shape({
    originCountry: Yup.string().required("Origin country is required"),
    originCity: Yup.string().required("Origin city is required"),
    destinationCountry: Yup.string().required("Destination country is required"),
    destinationCity: Yup.string().required("Destination city is required"),
    departureDate: Yup.string().required("Departure date is required"),
    departureAt: Yup.string().required("Departure time is required"),
    arrivalDate: Yup.string().required("Arrival date is required"),
    arrivalAt: Yup.string().required("Arrival time is required"),
    mode: Yup.string().required("Mode of travel is required"),
    spaceType: Yup.string().required("Required"),
    spaceNumber: Yup.string().required("Enter the number of spaces available"),
    flightNumber: Yup.string().when('modeOfTravel', {
        is: 'Flight',
        then: (schema) => schema.required('Flight number is required for flights'),
        otherwise: (schema) => schema.notRequired(),
    }),
    vehiclePlate: Yup.string().when('modeOfTravel', {
        is: 'Car',
        then: (schema) => schema.required('Vehicle plate is required for car travel'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const initialValues = {
    userId:0,
    originCountry: "",
    originCity: "",
    destinationCountry: "",
    destinationCity: "",
    departureDate: "",
    departureAt: "",
    arrivalDate: "",
    arrivalAt: "",
    mode: "",
    spaceType: "",
    spaceNumber: "",
    flightNumber: "",
    vehiclePlate: "",
};

const cities = [
    'Nairobi',
    'Dodoma',
    'Mombasa',
    'Kampala',
    'Kigali',
    'Dar es Salaam',
];

const countries = [
    'Kenya',
    'Tanzania',
    'Uganda',
    'Rwanda',
    'Burundi',
];

const modes = [
    'FLIGHT',
    'CAR',
];

const spaceTypes = [
    "Package Space",
    "Seats Available",
];

const TravellerDetailsForm: React.FC<TravellerDetailsFormProps> = ({
    onSubmit,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);
    const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
    const [tempArrivalDate, setTempArrivalDate] = useState(new Date());
    const [tempArrivalTime, setTempArrivalTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Traveller Details</Text>

            <ProgressBar step={1} labels={["Destination", "What to Carry"]} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={ValidationSchema}
                    onSubmit={async (values) => {
                        try {
                            setLoading(true);
                            

                            const toISO = (date: string, time: string) => {

                                const [year, month, day] = date.split("-").map(Number);

                                let [hour, minute] = time.replace(" AM", "").replace(" PM", "").split(":").map(Number);

                                const isPM = time.includes("PM");

                                if (isPM && hour < 12) hour += 12;
                                if (!isPM && hour === 12) hour = 0;

                                const d = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

                                return d.toISOString();
                            };

                            values.departureAt = toISO(values.departureDate, values.departureAt);
                            values.arrivalAt = toISO(values.arrivalDate, values.arrivalAt);

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
                            <Text style={styles.sectionTitle}>Departure</Text>

                            <Text style={styles.inputLabel}>Country</Text>
                            <CustomDropdown
                                value={values.originCountry}
                                options={countries}
                                onSelect={(value) => setFieldValue('originCountry', value)}
                                showLabel={false}
                            />
                            {touched.originCountry && errors.originCountry && (
                                <Text style={styles.errorText}>{errors.originCountry}</Text>
                            )}

                            <Text style={styles.inputLabel}>City</Text>
                            <CustomDropdown
                                value={values.originCity}
                                options={cities}
                                onSelect={(value) => setFieldValue('originCity', value)}
                                showLabel={false}
                            />
                            {touched.originCity && errors.originCity && (
                                <Text style={styles.errorText}>{errors.originCity}</Text>
                            )}

                            <Text style={styles.inputLabel}>Departure Date/Time</Text>
                            <View style={styles.rowContainer}>
                                <View style={styles.inputWrapper}>
                                    <TouchableOpacity
                                        style={styles.datePicker}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[styles.dateText, !values.departureDate  && styles.placeholderText]}>
                                            {values.departureDate ? values.departureDate : 'Date'}
                                        </Text>
                                    </TouchableOpacity>
                                    {touched.departureDate  && errors.departureDate  && (
                                        <Text style={styles.errorText}>{errors.departureDate }</Text>
                                    )}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <TouchableOpacity
                                        style={styles.datePicker}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={[styles.dateText, !values.departureAt && styles.placeholderText]}>
                                            {values.departureAt? values.departureAt : 'Time'}
                                        </Text>
                                    </TouchableOpacity>
                                    {touched.departureAt && errors.departureAt && (
                                        <Text style={styles.errorText}>{errors.departureAt}</Text>
                                    )}
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Destination</Text>

                            <Text style={styles.inputLabel}>Country</Text>
                            <CustomDropdown
                                value={values.destinationCountry}
                                options={countries}
                                onSelect={(value) => setFieldValue('destinationCountry', value)}
                                showLabel={false}
                            />
                            {touched.destinationCountry && errors.destinationCountry && (
                                <Text style={styles.errorText}>{errors.destinationCountry}</Text>
                            )}

                            <Text style={styles.inputLabel}>City</Text>
                            <CustomDropdown
                                value={values.destinationCity}
                                options={cities}
                                onSelect={(value) => setFieldValue('destinationCity', value)}
                                showLabel={false}
                            />
                            {touched.destinationCity && errors.destinationCity && (
                                <Text style={styles.errorText}>{errors.destinationCity}</Text>
                            )}

                            <Text style={styles.inputLabel}>Arrival Date/Time</Text>
                            <View style={styles.rowContainer}>
                                <View style={styles.inputWrapper}>
                                    <TouchableOpacity
                                        style={styles.datePicker}
                                        onPress={() => setShowArrivalDatePicker(true)}
                                    >
                                        <Text style={[styles.dateText, !values.arrivalDate && styles.placeholderText]}>
                                            {values.arrivalDate ? values.arrivalDate : 'Date'}
                                        </Text>
                                    </TouchableOpacity>
                                    {touched.arrivalDate && errors.arrivalDate && (
                                        <Text style={styles.errorText}>{errors.arrivalDate}</Text>
                                    )}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <TouchableOpacity
                                        style={styles.datePicker}
                                        onPress={() => setShowArrivalTimePicker(true)}
                                    >
                                        <Text style={[styles.dateText, !values.arrivalAt && styles.placeholderText]}>
                                            {values.arrivalAt ? values.arrivalAt : 'Time'}
                                        </Text>
                                    </TouchableOpacity>
                                    {touched.arrivalAt && errors.arrivalAt && (
                                        <Text style={styles.errorText}>{errors.arrivalAt}</Text>
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
                                            setFieldValue('departureDate', formatted);
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
                                            setFieldValue('departureAt', formatted);
                                        }
                                    }}
                                />
                            )}

                            {showArrivalDatePicker && (
                                <DateTimePicker
                                    value={tempArrivalDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        if (Platform.OS === 'android') setShowArrivalDatePicker(false);
                                        if (event.type === 'set' && selectedDate) {
                                            const formatted = selectedDate.toISOString().split('T')[0];
                                            setTempArrivalDate(selectedDate);
                                            setFieldValue('arrivalDate', formatted);
                                        }
                                    }}
                                    minimumDate={new Date()}
                                />
                            )}

                            {showArrivalTimePicker && (
                                <DateTimePicker
                                    value={tempArrivalTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedTime) => {
                                        if (Platform.OS === 'android') setShowArrivalTimePicker(false);
                                        if (event.type === 'set' && selectedTime) {
                                            const formatted = selectedTime.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            });
                                            setTempArrivalTime(selectedTime);
                                            setFieldValue('arrivalAt', formatted);
                                        }
                                    }}
                                />
                            )}

                            <Text style={styles.sectionTitle}>Travel Details</Text>

                            <Text style={styles.inputLabel}>Mode Of Travel</Text>
                            <CustomDropdown
                                value={values.mode}
                                options={modes}
                                onSelect={(value) => setFieldValue('mode', value)}
                                showLabel={false}
                            />
                            {touched.mode && errors.mode && (
                                <Text style={styles.errorText}>{errors.mode}</Text>
                            )}

                            {values.mode === 'FLIGHT' && (
                                <>
                                    <Text style={styles.inputLabel}>Flight Number</Text>
                                    <CustomTextInput
                                        value={values.flightNumber}
                                        onChangeText={handleChange('flightNumber')}
                                        placeholder='e.g., KQ101'
                                    />
                                    {touched.flightNumber && errors.flightNumber && (
                                        <Text style={styles.errorText}>{errors.flightNumber}</Text>
                                    )}
                                </>
                            )}

                            {values.mode === 'CAR' && (
                                <>
                                    <Text style={styles.inputLabel}>Vehicle Plate Number</Text>
                                    <CustomTextInput
                                        value={values.vehiclePlate}
                                        onChangeText={handleChange('vehiclePlate')}
                                        placeholder='e.g., KCA 123A'
                                    />
                                    {touched.vehiclePlate && errors.vehiclePlate && (
                                        <Text style={styles.errorText}>{errors.vehiclePlate}</Text>
                                    )}
                                </>
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
                                    keyboardType='numeric'
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
            </ScrollView>
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
    sectionTitle: {
        ...Theme.typography.body,
        color: Theme.colors.black,
        marginTop: Theme.spacing.xs,
        marginBottom: Theme.spacing.sm,
        fontWeight: '500',
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
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        borderColor: Theme.colors.black,
    },
    dimensionInput: {
        flex: 1,
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