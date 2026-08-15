import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import OnboardingScreen from "./(onboarding)";
import "./global.css";

export default function Index() {
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const value = await AsyncStorage.getItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(value === "true");
      setCheckingOnboarding(false);
    };
    checkOnboardingStatus();
  }, []);

  if (checkingOnboarding) {
    return null;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <>
      <OnboardingScreen />
    </>
  );
}
