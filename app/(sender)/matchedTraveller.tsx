import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MatchedTravellerScreen = () => {
  const { shipmentId, packageId, travellerUserId, travellerName, rating } =
    useLocalSearchParams<{
      shipmentId?: string;
      packageId?: string;
      travellerUserId?: string;
      travellerName?: string;
      rating?: string;
    }>();
  const { userId } = useContext(AuthContext);

  const displayName = travellerName || "Your Traveller";
  const parsedRating = rating ? Number(rating) : null;
  const displayRating =
    parsedRating !== null && Number.isFinite(parsedRating) ? parsedRating.toFixed(1) : null;
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleStartChat = () => {
    if (!userId || !travellerUserId) {
      return;
    }

    const conversationId = [userId, travellerUserId].sort().join("_");
    router.push({
      pathname: "/(chat)/[conversationId]",
      params: {
        conversationId,
        receiverId: travellerUserId,
        receiverName: displayName,
      },
    });
  };

  const handleViewDetails = () => {
    if (!shipmentId) {
      return;
    }

    router.push({
      pathname: "/(sender)/travellerMatchDetails",
      params: {
        shipmentId,
        packageId: packageId || "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={34} color={Theme.colors.primary} />
        </View>

        <Text style={styles.eyebrow}>TRAVELLER CONFIRMED</Text>
        <Text style={styles.title}>Your shipment has a traveller</Text>
        <Text style={styles.subtitle}>
          You can now view the shipment details or contact your traveller.
        </Text>

        <View style={styles.travellerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.nameText}>{displayName}</Text>
          <View style={styles.ratingRow}>
            {displayRating ? (
              <>
                <Ionicons name="star" size={15} color={Theme.colors.orange} />
                <Text style={styles.ratingText}>{displayRating}</Text>
              </>
            ) : (
              <Text style={styles.ratingText}>New traveller</Text>
            )}
          </View>
        </View>

        <View style={styles.iconActions}>
          <View style={styles.iconAction}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Message ${displayName}`}
              accessibilityState={{ disabled: !userId || !travellerUserId }}
              disabled={!userId || !travellerUserId}
              style={[styles.iconButton, (!userId || !travellerUserId) && styles.disabledAction]}
              onPress={handleStartChat}
            >
              <Ionicons name="chatbubble-ellipses" size={25} color={Theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Message</Text>
          </View>

          <View style={styles.iconAction}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View shipment details"
              accessibilityState={{ disabled: !shipmentId }}
              disabled={!shipmentId}
              style={[
                styles.iconButton,
                styles.secondaryIconButton,
                !shipmentId && styles.disabledAction,
              ]}
              onPress={handleViewDetails}
            >
              <Ionicons name="document-text-outline" size={25} color={Theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Details</Text>
          </View>

          <View style={styles.iconAction}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go home"
              style={[styles.iconButton, styles.secondaryIconButton]}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Ionicons name="home-outline" size={25} color={Theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Home</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 320,
    marginTop: Theme.spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  travellerCard: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.yellow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  avatarInitials: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  nameText: {
    fontSize: 19,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  ratingRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.xs,
  },
  ratingText: {
    marginLeft: Theme.spacing.xs,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  iconActions: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
  },
  iconAction: {
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  iconButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryIconButton: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  disabledAction: {
    opacity: 0.45,
  },
  iconLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
});

export default MatchedTravellerScreen;
