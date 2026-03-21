import Theme from '@/constants/Theme';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CustomButton from '../../ui/CustomButton';
import PhoneNumberInput, { DEFAULT_COUNTRY, Country } from '../../ui/PhoneNumberInput';

interface VerifyPhoneNoFormProps {
  onSubmit: (phoneNumber: string, country: Country) => void;
}

const VerifyPhoneNoForm: React.FC<VerifyPhoneNoFormProps> = ({ onSubmit }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [inputValue, setInputValue] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Verify</Text>
          <Text style={styles.subHeading}>Account</Text>
        </View>

        <Text style={styles.subtitle}>
          For your security and updates, we'll need to verify your phone number.
        </Text>

        <PhoneNumberInput
          value={inputValue}
          onChangePhoneNumber={setInputValue}
          selectedCountry={selectedCountry}
          onChangeCountry={setSelectedCountry}
        />

        <CustomButton
          title="Send OTP"
          variant="primary"
          style={{ marginTop: 32 }}
          onPress={() => onSubmit(inputValue, selectedCountry)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f2",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: Theme.spacing.lg,
  },
  heading: {
    fontSize: 34,
    color: Theme.colors.primary,
    fontWeight: '400',
  },
  subHeading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  subtitle: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    marginBottom: 32,
  },
});

export default VerifyPhoneNoForm;
