import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import OnboardingScreen from "./(onboarding)";
import "./global.css";

export default function Index() {
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const value = await AsyncStorage.getItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(value === "true");
      setCheckingOnboarding(false);
    };
    checkOnboardingStatus();
  }, []);

  if (checkingOnboarding || authLoading) {
    return null;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)"} />;
  }

  return (
    <>
      <OnboardingScreen />
    </>
  );
}
