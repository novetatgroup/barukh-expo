import OnboardingScreen from "./(onboarding)/index";
import "./global.css";

export default function Index() {
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);

  return (
    <OnboardingScreen />
  );
}
