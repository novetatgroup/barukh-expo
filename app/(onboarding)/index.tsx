// app/(onboarding)/index.tsx
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Logo from "../../assets/images/logo.png";
import styles from "../styles/onboardingStyles";

const { width } = Dimensions.get("window");

interface OnboardingItem {
  title: string;
  subtitle: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    title: "Send Smarter,\nAcross Borders",
    subtitle: "Shop anywhere. Let trusted travelers deliver for less.",
    image: Logo,
  },
  {
    title: "Verified\nTravelers Only",
    subtitle: "Every delivery is matched with a vetted, rated traveler",
    image: Logo,
  },
  {
    title: "Pay When\nDelivered",
    subtitle:
      "Your money is held securely until the recipient confirms delivery",
    image: Logo,
  },
];

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
    } else {
      router.replace("/(auth)");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentStep(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slide, { width }]}>
      {item.image && (
        <Image source={item.image} style={styles.logo} resizeMode="contain" />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A5D52" />

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityLabel={
              currentStep < onboardingData.length - 1
                ? "Go to next screen"
                : "Complete onboarding"
            }
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>
              {currentStep < onboardingData.length - 1 ? "Next" : "Get Started"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
