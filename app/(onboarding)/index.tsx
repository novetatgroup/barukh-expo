import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { Logo } from "../../assets/svgs/index";
import styles from "../styles/onboardingStyles";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "0",
    title: "Send Smarter,\nAcross Borders",
    subtitle: "Shop anywhere. Let trusted travelers deliver for less.",
    ImageComponent: Logo,
  },
  {
    id: "1",
    title: "Verified\nTravelers Only",
    subtitle: "Every delivery is matched with a vetted, rated traveler",
    ImageComponent: Logo,
  },
  {
    id: "2",
    title: "Pay When\nDelivered",
    subtitle:
      "Your money is held securely until the recipient confirms delivery",
    ImageComponent: Logo,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

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

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={[styles.content, { width }]}>
      {item.ImageComponent && (
        <View style={{ marginTop: 325, marginBottom: 20 }}>
          <item.ImageComponent width={45} height={45} />
        </View>
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      <View style={styles.dotsContainer}>
        {onboardingData.map((_, dotIndex) => (
          <View
            key={dotIndex}
            style={[
              styles.dot,
              dotIndex === currentStep ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const isLastStep = currentStep === onboardingData.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A5D52" />

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      <View style={[styles.buttonContainer, fixedStyles.buttonContainerFixed]}>
        <TouchableOpacity
          style={isLastStep ? styles.nextButton : styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text
            style={isLastStep ? styles.nextButtonText : styles.skipButtonText}
          >
            {isLastStep ? "Get Started" : "Skip"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const fixedStyles = StyleSheet.create({
  buttonContainerFixed: {
    minHeight: 130,
  },
});
