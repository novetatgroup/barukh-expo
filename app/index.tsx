import OnboardingScreen from "./(onboarding)";
import "./global.css";

export default function Index() {
  return (
    <>
      {/* <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-5xl font-bold text-primary">Welcome!</Text>
      <Link href="/(onboarding)" className="mt-5 text-lg text-primary">
        Go to Onboarding Screen
      </Link>
    </View> */}
      <OnboardingScreen />
    </>
  );
}
