// Phone number verification step is temporarily disabled — KYC flow now jumps straight to addDetailsScreen.
// import { View, StyleSheet } from 'react-native';
// import VerifyPhoneNoForm from '@/components/forms/KYC/VerifyPhoneNoForm';
// import { router } from 'expo-router';
// import { Country } from '@/components/ui/PhoneNumberInput';
//
// const VerifyPhoneNoScreen = () => {
//   const handleSubmit = (_phoneNumber: string, _country: Country) => {
//     router.push("/(KYC)/phoneOtpScreen");
//   };
//
//   return (
//     <View style={styles.container}>
//       <View style={styles.wrapper}>
//         <VerifyPhoneNoForm onSubmit={handleSubmit} />
//       </View>
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f4f1f2",
//   },
//   wrapper: {
//     flex: 1,
//     paddingHorizontal: 24,
//   },
// });

const VerifyPhoneNoScreen = () => null;

export default VerifyPhoneNoScreen;
