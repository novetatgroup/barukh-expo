import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { SEARCH_RADII_KM, TravellerMatchingState } from "@/hooks/useTravellerMatching";
import { AutoAssignedTrip } from "@/services/senderService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TravellerMatchingScreenProps {
  state: TravellerMatchingState;
  currentRadius: number;
  matchedTrip: AutoAssignedTrip | null;
  errorMessage: string;
  shipmentMessage: string;
  onRetrySearch: () => void;
  onRetryShipment: () => void;
  onGoHome: () => void;
}

const getTravellerName = (trip: AutoAssignedTrip) =>
  `${trip.travellerFirstName} ${trip.travellerLastName}`.trim();

const getInitials = (trip: AutoAssignedTrip) =>
  [trip.travellerFirstName, trip.travellerLastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const LoadingDots = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, useNativeDriver: true }),
          Animated.delay((2 - index) * 160),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
    // Animated values remain stable for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow} accessibilityElementsHidden>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [
                { scale: dot.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const SearchAnimation = ({
  title,
  subtitle,
  resolving,
  radiusKm,
}: {
  title: string;
  subtitle: string;
  resolving: boolean;
  radiusKm?: number;
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.loadingContent} accessibilityLiveRegion="polite">
      <View style={styles.pulseContainer}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0] }),
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] }) },
              ],
            },
          ]}
        />
        <View style={styles.searchIconCircle}>
          <Ionicons
            name={resolving ? "checkmark" : "search"}
            size={34}
            color={Theme.colors.white}
          />
        </View>
      </View>
      <Text style={styles.loadingTitle}>{title}</Text>
      <Text style={styles.loadingSubtitle}>{subtitle}</Text>
      {typeof radiusKm === "number" ? <SearchRadiusProgress currentRadius={radiusKm} /> : null}
      <LoadingDots />
    </View>
  );
};

const SearchRadiusProgress = ({ currentRadius }: { currentRadius: number }) => {
  const stepIndex = SEARCH_RADII_KM.indexOf(currentRadius as (typeof SEARCH_RADII_KM)[number]);
  const totalSteps = SEARCH_RADII_KM.length;
  const activeStep = stepIndex === -1 ? 1 : stepIndex + 1;
  const progress = activeStep / totalSteps;
  const widthAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  return (
    <View style={styles.progressWrapper}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        Step {activeStep} of {totalSteps} · searching up to {currentRadius} km
      </Text>
    </View>
  );
};

const ResultState = ({
  empty,
  message,
  onRetry,
  onGoHome,
}: {
  empty: boolean;
  message: string;
  onRetry: () => void;
  onGoHome: () => void;
}) => (
  <View style={styles.resultContent} accessibilityLiveRegion="polite">
    <View style={styles.resultIconCircle}>
      <Ionicons
        name={empty ? "search-outline" : "alert-circle-outline"}
        size={42}
        color={Theme.colors.primary}
      />
    </View>
    <Text style={styles.resultTitle}>{empty ? "No trips found" : "Couldn't complete search"}</Text>
    <Text style={styles.resultSubtitle}>{message}</Text>
    <View style={styles.resultButtons}>
      <CustomButton title="Try Again" onPress={onRetry} style={styles.fullWidthButton} />
      <CustomButton
        title="Go Home"
        variant="secondary"
        onPress={onGoHome}
        style={styles.fullWidthButton}
      />
    </View>
  </View>
);

const ShipmentPendingState = ({
  trip,
  message,
  onRetry,
  onGoHome,
}: {
  trip: AutoAssignedTrip;
  message: string;
  onRetry: () => void;
  onGoHome: () => void;
}) => (
  <View style={styles.pendingContent} accessibilityLiveRegion="polite">
    <View style={styles.successIcon}>
      <Ionicons name="checkmark" size={30} color={Theme.colors.primary} />
    </View>
    <Text style={styles.resultTitle}>Traveller matched</Text>
    <Text style={styles.resultSubtitle}>
      {message || "Shipment details are still being prepared. This can take a moment."}
    </Text>

    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(trip)}</Text>
        </View>
        <View style={styles.matchIdentity}>
          <Text style={styles.matchName} numberOfLines={1}>
            {getTravellerName(trip)}
          </Text>
          <Text style={styles.matchMeta}>Confirmed match</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Pickup distance</Text>
          <Text style={styles.metricValue}>{trip.originDistanceKm.toFixed(1)} km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Drop-off distance</Text>
          <Text style={styles.metricValue}>{trip.destinationDistanceKm.toFixed(1)} km</Text>
        </View>
      </View>
      <Text style={styles.capacityText}>
        {trip.remainingCapacity} {trip.remainingCapacity === 1 ? "space" : "spaces"} available - up
        to {trip.maxWeightKg} kg
      </Text>
    </View>

    <View style={styles.resultButtons}>
      <CustomButton title="Retry Details" onPress={onRetry} style={styles.fullWidthButton} />
      <CustomButton
        title="Go Home"
        variant="secondary"
        onPress={onGoHome}
        style={styles.fullWidthButton}
      />
    </View>
  </View>
);

const TravellerMatchingScreen = ({
  state,
  currentRadius,
  matchedTrip,
  errorMessage,
  shipmentMessage,
  onRetrySearch,
  onRetryShipment,
  onGoHome,
}: TravellerMatchingScreenProps) => {
  if (state === "searching") {
    const expanding = currentRadius > 7;
    return (
      <SafeAreaView style={styles.container}>
        <SearchAnimation
          title={expanding ? `Expanding search to ${currentRadius} km` : "Finding a traveller"}
          subtitle={
            expanding
              ? `Checking trips within ${currentRadius} km of pickup and drop-off.`
              : "Checking nearby trips for route and package compatibility."
          }
          resolving={false}
          radiusKm={currentRadius}
        />
      </SafeAreaView>
    );
  }

  if (state === "resolving-shipment") {
    return (
      <SafeAreaView style={styles.container}>
        <SearchAnimation
          title="Finalizing your shipment"
          subtitle={
            matchedTrip
              ? `${getTravellerName(matchedTrip)} is matched. We're preparing the shipment details.`
              : "Your traveller is matched. We're preparing the shipment details."
          }
          resolving
        />
      </SafeAreaView>
    );
  }

  if (state === "shipment-pending" && matchedTrip) {
    return (
      <SafeAreaView style={styles.container}>
        <ShipmentPendingState
          trip={matchedTrip}
          message={shipmentMessage}
          onRetry={onRetryShipment}
          onGoHome={onGoHome}
        />
      </SafeAreaView>
    );
  }

  if (state === "empty") {
    return (
      <SafeAreaView style={styles.container}>
        <ResultState
          empty
          message="We searched up to 10 km from both pickup and drop-off, but no compatible trip is available yet."
          onRetry={onRetrySearch}
          onGoHome={onGoHome}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ResultState
        empty={false}
        message={errorMessage || "The matching service could not complete the search. Please try again."}
        onRetry={onRetrySearch}
        onGoHome={onGoHome}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  pulseContainer: {
    width: 156,
    height: 156,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  pulseRing: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: Theme.colors.primary,
  },
  searchIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
  },
  loadingTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    textAlign: "center",
  },
  loadingSubtitle: {
    maxWidth: 320,
    marginTop: Theme.spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  progressWrapper: {
    width: "100%",
    maxWidth: 280,
    marginTop: Theme.spacing.lg,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.background.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Theme.colors.yellow,
  },
  progressLabel: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  dotsRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  resultIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.yellow,
    marginBottom: Theme.spacing.lg,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    textAlign: "center",
  },
  resultSubtitle: {
    maxWidth: 330,
    marginTop: Theme.spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  resultButtons: {
    width: "100%",
    maxWidth: 340,
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xl,
  },
  fullWidthButton: {
    width: "100%",
    marginTop: 0,
    marginBottom: 0,
  },
  pendingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.yellow,
    marginBottom: Theme.spacing.md,
  },
  matchCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.yellow,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  matchIdentity: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  matchName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  matchMeta: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  metric: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  metricValue: {
    marginTop: Theme.spacing.xs,
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  capacityText: {
    marginTop: Theme.spacing.md,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
});

export default TravellerMatchingScreen;
