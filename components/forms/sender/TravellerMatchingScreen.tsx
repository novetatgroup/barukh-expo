import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { TravellerMatchingState } from "@/hooks/useTravellerMatching";
import { MatchCandidate } from "@/services/senderService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TravellerMatchingScreenProps {
  state: TravellerMatchingState;
  candidates: MatchCandidate[];
  recommendedTripId: string | null;
  selectedTripId: string | null;
  errorMessage: string;
  noticeMessage: string;
  assignmentError: string;
  isAssigning: boolean;
  onSelectCandidate: (tripId: string) => void;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

interface CandidateCardProps {
  candidate: MatchCandidate;
  featured?: boolean;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatTravelDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMode = (value: string) => {
  const normalized = value.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
};

const CandidateCard = ({
  candidate,
  featured = false,
  selected,
  disabled,
  onPress,
}: CandidateCardProps) => {
  const ratingLabel = candidate.rating === null ? "New" : candidate.rating.toFixed(1);
  const score = Math.round(candidate.matchScore * 100);
  const spaceLabel = `${candidate.remainingCapacity} ${
    candidate.remainingCapacity === 1 ? "space" : "spaces"
  } available`;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      accessibilityRole="radio"
      accessibilityLabel={`${candidate.travellerName}, ${score}% package fit${
        featured ? ", recommended" : ""
      }`}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.candidateCard,
        featured && styles.featuredCard,
        selected && styles.selectedCard,
        disabled && styles.disabledCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, featured && styles.featuredAvatar]}>
          <Text style={styles.avatarText}>{getInitials(candidate.travellerName)}</Text>
        </View>

        <View style={styles.identityBlock}>
          <Text style={[styles.candidateName, featured && styles.featuredName]} numberOfLines={1}>
            {candidate.travellerName}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Theme.colors.orange} />
            <Text style={styles.ratingText}>{ratingLabel}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.modeText}>{formatMode(candidate.mode)}</Text>
          </View>
        </View>

        {featured ? (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        ) : (
          <View style={[styles.selectionCircle, selected && styles.selectionCircleSelected]}>
            {selected ? (
              <Ionicons name="checkmark" size={15} color={Theme.colors.primary} />
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.routeRow}>
        <Ionicons name="location-outline" size={17} color={Theme.colors.primary} />
        <Text style={styles.routeText} numberOfLines={1}>
          {candidate.originCity} to {candidate.destinationCity}
        </Text>
      </View>

      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Theme.colors.text.gray} />
          <Text style={styles.detailText}>{formatTravelDate(candidate.departureAt)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cube-outline" size={16} color={Theme.colors.text.gray} />
          <Text style={styles.detailText}>{spaceLabel}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.distanceText}>
          Pickup {candidate.originDistanceKm.toFixed(1)} km • Drop-off{" "}
          {candidate.destinationDistanceKm.toFixed(1)} km
        </Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{score}% fit</Text>
        </View>
      </View>

      {featured ? (
        <View style={styles.featuredSelectionRow}>
          <View style={[styles.selectionCircle, selected && styles.selectionCircleSelected]}>
            {selected ? (
              <Ionicons name="checkmark" size={15} color={Theme.colors.primary} />
            ) : null}
          </View>
          <Text style={styles.featuredSelectionText}>
            {selected ? "Selected traveller" : "Select this traveller"}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

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
          Animated.delay(index * 180),
          Animated.timing(dot, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 360, useNativeDriver: true }),
          Animated.delay((2 - index) * 180),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
    // Animated values are stable for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [
                {
                  scale: dot.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const TravellerSearchAnimation = () => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (animation: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const animations = [
      createPulse(pulseAnim1, 0),
      createPulse(pulseAnim2, 600),
      createPulse(pulseAnim3, 1200),
      Animated.loop(
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
        ]),
      ),
    ];

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [iconBounce, pulseAnim1, pulseAnim2, pulseAnim3]);

  const renderPulse = (animation: Animated.Value, size: number) => (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          opacity: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.4, 0.15, 0],
          }),
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, size / 80],
              }),
            },
          ],
        },
      ]}
    />
  );

  return (
    <View style={styles.loadingContent}>
      <View style={styles.pulseContainer}>
        {renderPulse(pulseAnim1, 200)}
        {renderPulse(pulseAnim2, 280)}
        {renderPulse(pulseAnim3, 360)}
        <Animated.View
          style={[styles.searchIconCircle, { transform: [{ translateY: iconBounce }] }]}
        >
          <Ionicons name="cube-outline" size={40} color={Theme.colors.white} />
        </Animated.View>
      </View>
      <Text style={styles.loadingTitle}>Finding compatible travellers</Text>
      <Text style={styles.loadingSubtitle}>
        Checking route, timing, capacity, and package fit
      </Text>
      <LoadingDots />
    </View>
  );
};

interface ResultStateProps {
  empty: boolean;
  message: string;
  onRetry: () => void;
  onGoHome: () => void;
}

const ResultState = ({ empty, message, onRetry, onGoHome }: ResultStateProps) => (
  <View style={styles.resultContent}>
    <View style={styles.resultIconCircle}>
      <Ionicons
        name={empty ? "people-outline" : "alert-circle-outline"}
        size={48}
        color={Theme.colors.primary}
      />
    </View>
    <Text style={styles.resultTitle}>
      {empty ? "No compatible travellers" : "Couldn't load matches"}
    </Text>
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

const TravellerMatchingScreen = ({
  state,
  candidates,
  recommendedTripId,
  selectedTripId,
  errorMessage,
  noticeMessage,
  assignmentError,
  isAssigning,
  onSelectCandidate,
  onConfirm,
  onRetry,
  onBack,
  onGoHome,
}: TravellerMatchingScreenProps) => {
  const recommendedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.tripId === recommendedTripId) ?? null,
    [candidates, recommendedTripId],
  );
  const alternatives = useMemo(
    () => candidates.filter((candidate) => candidate.tripId !== recommendedTripId),
    [candidates, recommendedTripId],
  );

  if (state === "loading") {
    return (
      <SafeAreaView style={styles.container}>
        <TravellerSearchAnimation />
      </SafeAreaView>
    );
  }

  if (state === "empty") {
    return (
      <SafeAreaView style={styles.container}>
        <ResultState
          empty
          message={
            noticeMessage ||
            "No active trip can carry your package and meet its route and deadline right now."
          }
          onRetry={onRetry}
          onGoHome={onGoHome}
        />
      </SafeAreaView>
    );
  }

  if (state === "error" || !recommendedCandidate) {
    return (
      <SafeAreaView style={styles.container}>
        <ResultState
          empty={false}
          message={errorMessage || "The matching response was incomplete. Please try again."}
          onRetry={onRetry}
          onGoHome={onGoHome}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Choose a traveller</Text>
          <Text style={styles.headerSubtitle}>All options fit your package</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {noticeMessage ? (
          <View style={styles.noticeBanner} accessibilityRole="alert">
            <Ionicons name="information-circle-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.noticeText}>{noticeMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Best match for your shipment</Text>
        <CandidateCard
          candidate={recommendedCandidate}
          featured
          selected={selectedTripId === recommendedCandidate.tripId}
          disabled={isAssigning}
          onPress={() => onSelectCandidate(recommendedCandidate.tripId)}
        />

        {alternatives.length > 0 ? (
          <View style={styles.alternativesSection}>
            <Text style={styles.sectionTitle}>Other compatible travellers</Text>
            <Text style={styles.sectionSubtitle}>
              Compare route, date, and available carrying space.
            </Text>
            {alternatives.map((candidate) => (
              <CandidateCard
                key={candidate.tripId}
                candidate={candidate}
                selected={selectedTripId === candidate.tripId}
                disabled={isAssigning}
                onPress={() => onSelectCandidate(candidate.tripId)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.onlyMatchText}>This is the only compatible traveller right now.</Text>
        )}

        {assignmentError ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={20} color={Theme.colors.error} />
            <Text style={styles.errorBannerText}>{assignmentError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Confirm Traveller"
          loading={isAssigning}
          disabled={!selectedTripId || isAssigning}
          onPress={onConfirm}
          accessibilityLabel="Confirm selected traveller"
          style={styles.confirmButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingVertical: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  headerSubtitle: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginTop: -Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  candidateCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featuredCard: {
    padding: Theme.spacing.lg,
  },
  selectedCard: {
    borderColor: Theme.colors.primary,
  },
  disabledCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.background.border,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.yellow,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  identityBlock: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    minWidth: 0,
  },
  candidateName: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  featuredName: {
    fontSize: 17,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.xs,
  },
  ratingText: {
    marginLeft: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.gray,
  },
  metaSeparator: {
    marginHorizontal: Theme.spacing.xs,
    fontSize: 12,
    color: Theme.colors.text.lightGray,
  },
  modeText: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    backgroundColor: Theme.colors.yellow,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.text.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionCircleSelected: {
    backgroundColor: Theme.colors.yellow,
    borderColor: Theme.colors.yellow,
  },
  routeRow: {
    marginTop: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  routeText: {
    flex: 1,
    marginLeft: Theme.spacing.xs,
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "46%",
    flexGrow: 1,
  },
  detailText: {
    marginLeft: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.background.border,
  },
  distanceText: {
    flex: 1,
    marginRight: Theme.spacing.sm,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
  },
  scorePill: {
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.lightGreen,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  featuredSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.md,
  },
  featuredSelectionText: {
    marginLeft: Theme.spacing.sm,
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  alternativesSection: {
    marginTop: Theme.spacing.lg,
  },
  onlyMatchText: {
    marginTop: Theme.spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.lightGreen,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  noticeText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
    color: Theme.colors.primary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
    color: Theme.colors.error,
  },
  footer: {
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.background.border,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.sm,
  },
  confirmButton: {
    width: "100%",
    marginBottom: Theme.spacing.sm,
  },
  loadingContent: {
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
  searchIconCircle: {
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
  loadingTitle: {
    fontSize: 23,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  resultContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  resultIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  resultButtons: {
    width: "100%",
    marginTop: Theme.spacing.xl,
  },
  fullWidthButton: {
    width: "100%",
  },
});

export default TravellerMatchingScreen;
