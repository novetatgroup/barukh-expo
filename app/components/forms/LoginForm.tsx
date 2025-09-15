import { router } from "expo-router";
import { Formik } from 'formik';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import Theme from '../../constants/Theme';
import CustomButton from '../ui/CustomButton';
import CustomTextInput from '../ui/CustomTextInput';
import Divider from '../ui/Divider';
import FooterLink from '../ui/FooterLink';

type LoginFormProps = {
  onSubmit: (data: { email: string }) => void;
  onGooglePress: () => void;
  onLoginPress: () => void;

};
const { width: screenWidth } = Dimensions.get('window');

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
})

const initialValues = {
  email: '',

}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  onGooglePress, 
  onLoginPress 
}) => {

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo} 
      />

      <Image 
        source={require('../../../assets/images/grid.png')} 
        style={styles.grid} 
      />
      
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue your journey.</Text>
      
      <Formik
      initialValues={initialValues}
      validationSchema={ValidationSchema}
      onSubmit={(values, { setSubmitting }) => {
          console.log("Submitting from RegisterForm:", values);
          onSubmit(values);
          setSubmitting(false);
        }}>
       {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
          dirty
        }) => (
          <View style={styles.formContainer}>

            <Text style={styles.inputLabel}>Email</Text>
            <CustomTextInput
              placeholder="Enter your Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <CustomButton
              title="Send OTP"
              variant="primary"
              onPress={() => handleSubmit()}
              style={styles.otpButton}
              disabled={isSubmitting || !isValid || !dirty}
            />

            <Divider text="Or" />

            <CustomButton
              title="Google"
              variant="google"
              onPress={onGooglePress}
              showGoogleIcon={true}
            />

            <FooterLink
              text="Don't have an account?"
              linkText="Sign up"
               onLinkPress={() => router.push("/(auth)/register")}
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
    backgroundColor: Theme.colors.primary,
  },
  logo: {
    width: 45,
    height: 45,
    marginLeft: Theme.screenPadding.horizontal,
    marginTop: Theme.spacing.xxxxxxxl,

  },
  grid:{
    width: 350,
    height: 350,
    position: 'absolute', 
    top: 0,
    left: screenWidth - 240 - 10,
  },
  title: {
    ...Theme.typography.h1,
    textAlign: 'left',
    marginLeft: Theme.screenPadding.horizontal,
    color: Theme.colors.text.light,
  },
  subtitle: {
    ...Theme.typography.caption,
    marginLeft: Theme.screenPadding.horizontal,
    textAlign: 'left',
    marginTop: -10,
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.text.light,
  },
  formContainer: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.screenPadding.horizontal,
    flex: 1,
  },
  inputLabel: {
    ...Theme.typography.body,
    paddingBottom: Theme.spacing.sm,
    color: Theme.colors.text.dark,
    fontWeight: '600',
  },
  otpButton: {
    height: Theme.components.button.height,
    marginTop: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginForm;