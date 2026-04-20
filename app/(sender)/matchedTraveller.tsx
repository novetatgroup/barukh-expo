import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MatchedTravellerScreen = () => {
  const { packageId, travellerUserId, travellerName } = useLocalSearchParams<{
    packageId: string;
    travellerUserId: string;
    travellerName: string;
  }>();
  const { userId } = useContext(AuthContext);

  const displayName = travellerName ?? "Your Traveller";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>You've been matched{"\n"}with a Traveller</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>

      {/* Name + verified */}
      <View style={styles.nameRow}>
        <Text style={styles.nameText}>{displayName}</Text>
        <Ionicons name="checkmark-circle" size={20} color="#32BF5B" style={styles.verifiedIcon} />
      </View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name="star" size={14} color="#FFCB45" />
        ))}
        <Text style={styles.ratingText}>5.0</Text>
      </View>

      {/* Icon action buttons */}
      <View style={styles.iconActions}>
        <View style={styles.iconAction}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleStartChat}>
            <Ionicons name="chatbubble-ellipses" size={26} color={Theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Message</Text>
        </View>

        <View style={styles.iconAction}>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={handleRejectMatch}>
            <Ionicons name="close" size={26} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Reject</Text>
        </View>

        <View style={styles.iconAction}>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnSecondary]} onPress={() => router.replace("/(tabs)/home")}>
            <Ionicons name="home" size={26} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Home</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 31,
    fontFamily: "Inter-Regular",
    color: Theme.colors.primary,
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -1.2,
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarInitials: {
    fontSize: 44,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  nameText: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#111",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 56,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginLeft: 6,
  },
  iconActions: {
    flexDirection: "row",
    gap: 32,
  },
  iconAction: {
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnDanger: {
    backgroundColor: "#F4F1F2",
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  iconBtnSecondary: {
    backgroundColor: "#F4F1F2",
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  iconLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
  },
});

export default MatchedTravellerScreen;
