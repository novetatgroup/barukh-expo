import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Theme from '@/app/constants/Theme';
import CustomButton from '../../ui/CustomButton';
import PhoneInput, {
  ICountry,
} from 'react-native-international-phone-number';

interface VerifyPhoneNoFormProps {
  onSubmit: (phoneNumber: string, country: ICountry | null) => void;
}

const VerifyPhoneNoForm: React.FC<VerifyPhoneNoFormProps> = ({onSubmit}) => {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleInputValue = (phoneNumber: string) => {
    setInputValue(phoneNumber);
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Verify</Text>
        <Text style={styles.subHeading}>Account</Text>
      </View>

      <Text style={styles.subtitle}>
        For your security and updates, we’ll need to verify your phone number.
      </Text>

      <PhoneInput
        value={inputValue}
        onChangePhoneNumber={handleInputValue}
        selectedCountry={selectedCountry || undefined}
        onChangeSelectedCountry={handleSelectedCountry}
        placeholder=''
      />

      <CustomButton
        title="Send OTP"
        variant="primary"
        style={{ marginTop: 32 }}
         onPress={() => onSubmit(inputValue, selectedCountry)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
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
