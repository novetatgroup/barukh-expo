import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { router } from "expo-router"; 
import React, { useContext } from "react"; 
import { StyleSheet, View } from "react-native"; 
import Toast from "react-native-toast-message"; 
import VerifyOtpForm from "../components/forms/VerifyOtpForm"; 
import { AuthContext } from "../context/AuthContext";

const VerifyOtpScreen = () => { 
  const { setAuthState } = useContext(AuthContext); 
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleVerifyOtp = async ({ otp }: { otp: string }) => { 
    try { 
      const sessionId = await AsyncStorage.getItem("sessionId");
      const otpFlow = await AsyncStorage.getItem("otpFlow"); 
      if (!sessionId || !otpFlow) { 
        Toast.show({ 
          type: "error", 
          text1: "Please try again.", 
          position:"top",
         }); 
        
         return; 
    }

    const endpoint =
        otpFlow === "register"
          ? `${apiUrl}/users/register/verify-otp`
          : `${apiUrl}/users/login/verify-otp`;

    const response = await fetch(endpoint,
       { method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: otp, sessionId }),
        credentials: "include",
       }); 

    const data = await response.json();

    if (response.ok && data.accessToken) {
        setAuthState(data.accessToken);
        await AsyncStorage.removeItem("otpFlow");

        Toast.show({
          type: "success",
          text1: "OTP verified successfully!",
          position: "top",
          visibilityTime:4000,
        });
        
        setTimeout(() =>{
           router.push("/roleSelection");
        }, 2500)
        
        return;
      }

      const errorMessage =
        data?.message || data?.error || "Verification failed. Please try again.";

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
        position: "top",
        
      });
    } catch (error) {
      console.error("API error:", error);
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Please try again later.",
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <VerifyOtpForm onSubmit={handleVerifyOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default VerifyOtpScreen;