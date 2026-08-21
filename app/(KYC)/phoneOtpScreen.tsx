// OTP verification step is temporarily disabled — KYC flow now jumps straight to addDetailsScreen.
// import { StyleSheet, View } from "react-native";
// import VerifyPhoneOtpForm from "@/components/forms/KYC/PhoneOtp";
// import { router } from "expo-router";
//
// const PhoneOtpScreen = () => {
//   const handleVerifyOtp = async ({ otp: _otp }: { otp: string }) => {
//     router.push("/(KYC)/addDetailsScreen");
//   };
//
//   return (
//     <View style={styles.container}>
//       <VerifyPhoneOtpForm onSubmit={handleVerifyOtp} length={6} />
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

const PhoneOtpScreen = () => null;

export default PhoneOtpScreen;
