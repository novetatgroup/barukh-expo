import CustomButton from "@/app/components/ui/CustomButton";
import Theme from "@/app/constants/Theme";
import { AuthContext } from "@/app/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const MatchedTravellerScreen = () => {
  const { packageId, travellerUserId, travellerName } = useLocalSearchParams<{
    packageId: string;
    travellerUserId: string;
    travellerName: string;
  }>();
  const { userId } = useContext(AuthContext);

  const displayName = travellerName ?? "Your Traveller";

  const handleStartChat = () => {
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

  const handleRejectMatch = () => {
    Alert.alert(
      "Reject this match?",
      "We'll search for another traveller for your package.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () =>
            router.replace({
              pathname: "/(sender)/findingTraveller",
              params: { packageId },
            }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>You've been matched{"\n"}with a Traveller</Text>

        <Avatar name={displayName} />

        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <CustomButton
          title="Message Traveller"
          variant="primary"
          onPress={handleStartChat}
          style={styles.button}
        />
        <CustomButton
          title="Reject Match"
          variant="secondary"
          onPress={handleRejectMatch}
          style={styles.button}
        />
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")} style={styles.homeLink}>
          <Text style={styles.homeLinkText}>Go Home</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: Theme.colors.primary,
    fontFamily: 'Inter-Regular',
    textAlign: "center",
    lineHeight: 42,
    marginBottom: Theme.spacing.xxxl,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    color: Theme.colors.text.gray,
    marginLeft: 4,
  },
  bottomButtons: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxxl,
  },
  button: {
    width: "100%",
  },
  homeLink: {
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
  },
  homeLinkText: {
    fontSize: 14,
    color: Theme.colors.text.gray,
  },
});

export default MatchedTravellerScreen;
