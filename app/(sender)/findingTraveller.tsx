import CustomButton from "@/components/ui/CustomButton";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService } from "@/services/senderService";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type SearchState = "searching" | "success" | "failure";

const FindingTravellerScreen = () => {
  const { senderId, packageId } = useLocalSearchParams<{ senderId: string; packageId: string }>();
  const { accessToken } = useContext(AuthContext);
  const [searchState, setSearchState] = useState<SearchState>("searching");
  const [failureMessage, setFailureMessage] = useState("");

  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const pulseAnimsRef = useRef<Animated.CompositeAnimation[]>([]);

  const stopPulseAnimations = () => {
    pulseAnimsRef.current.forEach((anim) => anim.stop());
    pulseAnimsRef.current = [];
  };

  const startPulseAnimation = () => {
    stopPulseAnimations();

    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const pulse1 = createPulse(pulseAnim1, 0);
    const pulse2 = createPulse(pulseAnim2, 600);
    const pulse3 = createPulse(pulseAnim3, 1200);
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimsRef.current = [pulse1, pulse2, pulse3, bounce];
    pulse1.start();
    pulse2.start();
    pulse3.start();
    bounce.start();
  };

  const cancelledRef = useRef(false);

  const searchForTraveller = async () => {
    setSearchState("searching");
    setFailureMessage("");
    startPulseAnimation();

    if (!packageId || !accessToken) {
      stopPulseAnimations();
      setFailureMessage("Missing package or authentication info.");
      setSearchState("failure");
      return;
    }

    // Step 1 — auto-assign
    const assignResult = await senderService.autoAssign({ packageId }, accessToken);

    if (cancelledRef.current) return;

    if (!assignResult.ok || !assignResult.data) {
      stopPulseAnimations();
      setFailureMessage(assignResult.error || "Something went wrong. Please try again.");
      setSearchState("failure");
      return;
    }

    if (!assignResult.data.assigned || !assignResult.data.shipmentId) {
      stopPulseAnimations();
      const reasonMessages: Record<string, string> = {
        no_compatible_trips: "No compatible travellers found at this time.",
        no_active_trips: "There are no active travellers right now.",
      };
      setFailureMessage(
        reasonMessages[assignResult.data.reason ?? ""] ||
          "We couldn't find a traveller for your package right now."
      );
      setSearchState("failure");
      return;
    }

    // Step 2 — fetch shipment details to get traveller userId
    const shipmentResult = await senderService.getShipment(assignResult.data.shipmentId, accessToken);

    if (cancelledRef.current) return;

    if (!shipmentResult.ok || !shipmentResult.data) {
      stopPulseAnimations();
      setFailureMessage("Could not load match details. Please try again.");
      setSearchState("failure");
      return;
    }

    const travellerUserId = shipmentResult.data.traveller.userId;

    // Step 3 — fetch traveller's user profile for their name
    const userResult = await userService.getUser(travellerUserId, accessToken);

    if (cancelledRef.current) return;

    stopPulseAnimations();

    const travellerName = userResult.data
      ? `${userResult.data.firstName} ${userResult.data.lastName}`.trim()
      : "Your Traveller";

    router.replace({
      pathname: "/(sender)/matchedTraveller",
      params: {
        shipmentId: assignResult.data.shipmentId,
        packageId,
        travellerUserId,
        travellerName,
      },
    });
  };

  useEffect(() => {
    cancelledRef.current = false;
    searchForTraveller();
    return () => {
      cancelledRef.current = true;
      stopPulseAnimations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTryAgain = () => {
    cancelledRef.current = false;
    searchForTraveller();
  };

  const handleGoHome = () => {
    router.replace("/(tabs)/home");
  };


  const renderPulseRing = (anim: Animated.Value, size: number) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, size / 80],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.4, 0.15, 0],
    });

    return (
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  if (searchState === "searching") {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.pulseContainer}>
            {renderPulseRing(pulseAnim1, 200)}
            {renderPulseRing(pulseAnim2, 280)}
            {renderPulseRing(pulseAnim3, 360)}
            <Animated.View
              style={[
                styles.iconCircle,
                { transform: [{ translateY: iconBounce }] },
              ]}
            >
              <Ionicons name="cube-outline" size={40} color={Theme.colors.white} />
            </Animated.View>
          </View>

          <Text style={styles.searchingTitle}>Finding a Traveller</Text>
          <Text style={styles.searchingSubtitle}>
            Please wait as we find a traveller{"\n"}for your package
          </Text>

          <View style={styles.dotsContainer}>
            <LoadingDots />
          </View>
        </View>
      </View>
    );
  }

  if (searchState === "failure") {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.resultIconCircle}>
            <Ionicons name="sad-outline" size={48} color={Theme.colors.primary} />
          </View>

          <Text style={styles.resultTitle}>Oops!</Text>
          <Text style={styles.resultSubtitle}>
            {failureMessage}
          </Text>

          <View style={styles.resultButtons}>
            <CustomButton
              title="Try Again"
              variant="primary"
              onPress={handleTryAgain}
              style={styles.resultButton}
            />
            <CustomButton
              title="Go Home"
              variant="secondary"
              onPress={handleGoHome}
              style={styles.resultButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return null;
};

const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(200),
      ])
    );
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.3],
        }),
      },
    ],
  });

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  pulseContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.xxl,
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  searchingSubtitle: {
    fontSize: 16,
    color: Theme.colors.text.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  dotsContainer: {
    marginTop: Theme.spacing.xl,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  resultIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
 
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 16,
    color: Theme.colors.text.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  resultButtons: {
    width: "100%",
    marginTop: Theme.spacing.xxl,
    gap: 12,
  },
  resultButton: {
    width: "100%",
  },
});

export default FindingTravellerScreen;
