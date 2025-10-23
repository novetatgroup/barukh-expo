// app/(onboarding)/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
//import Logo from '../../assets/images/logo.png';
import { Logo } from '../../assets/svgs/index';
import styles from '../styles/onboardingStyles';

const onboardingData = [
  {
    title: "Send Smarter,\nAcross Borders",
    subtitle: "Shop anywhere. Let trusted travelers deliver for less.",
    //image: Logo,
    ImageComponent: Logo,
  },
  {
    title: "Verified\nTravelers Only",
    subtitle: "Every delivery is matched with a vetted, rated traveler",
    //image: Logo,
    ImageComponent: Logo,
  },
  {
    title: "Pay When\nDelivered",
    subtitle: "Your money is held securely until the recipient confirms delivery",
    //image: Logo,
    ImageComponent: Logo,
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(auth)');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)');
  };

  const currentData = onboardingData[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A5D52" />

      <View style={styles.content}>
        {/* {currentData.image && (
          <Image
            source={currentData.image}  
            style={{ width: 45, height: 45,marginTop: 325,marginBottom: 20 }}
            resizeMode="contain"
          />
          
        )} */}
        {currentData.ImageComponent && (
          <View style={{ marginTop: 325, marginBottom: 20 }}>
            <currentData.ImageComponent width={45} height={45} />
          </View>
        )}
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.subtitle}>{currentData.subtitle}</Text>

        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

