import OnboardingScreen from "./(onboarding)";
import "./global.css";

export default function Index() {
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);


  return (
    <>
      <OnboardingScreen />
      {/* <RoleSelectionScreen /> */}
      {/* <TravellerHomeScreen /> */}
    </>
  );
}
