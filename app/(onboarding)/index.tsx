import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { Logo } from "../../assets/svgs/index";
import styles from "@/styles/onboardingStyles";

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

type OnboardingSlideTextProps = {
  item: (typeof onboardingData)[0];
  index: number;
  scrollX: Animated.Value;
};

const OnboardingSlideText = ({ item, index, scrollX }: OnboardingSlideTextProps) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [12, 0, -12],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        fixedStyles.textStack,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
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

  const isLastStep = currentStep === onboardingData.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A5D52" />

      <View style={styles.content} pointerEvents="none">
        <View style={{ marginTop: 325, marginBottom: 20 }}>
          <Logo width={45} height={45} />
        </View>

        <View style={fixedStyles.textStackWrapper}>
          {onboardingData.map((item, index) => (
            <OnboardingSlideText key={item.id} item={item} index={index} scrollX={scrollX} />
          ))}
        </View>

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

      <Animated.FlatList
        data={onboardingData}
        renderItem={() => <View style={{ width }} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFillObject}
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
  textStackWrapper: {
    width: "100%",
    minHeight: 155,
    justifyContent: "center",
  },
  textStack: {
    alignItems: "center",
  },
});
