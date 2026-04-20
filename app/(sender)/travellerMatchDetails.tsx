import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService } from "@/services/senderService";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MatchData {
  travellerUserId: string;
  travellerName: string;
  tripRoute: string;
  travelDate: string;
  remainingSpace: string;
}

const TravellerMatchDetailsScreen = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const { packageId, itemName } = useLocalSearchParams<{
    packageId: string;
    itemName: string;
  }>();

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!packageId || !accessToken) return;

      setLoading(true);
      setError(null);

      // Step 1 — fetch existing shipment for this package
      const shipmentResult = await senderService.getShipmentByPackage(packageId, accessToken);
      if (!shipmentResult.ok || !shipmentResult.data) {
        setError("No traveller matched to this package yet.");
        setLoading(false);
        return;
      }

      const shipment = shipmentResult.data;
      const travellerUserId = shipment.traveller.userId;

      // Step 3 — fetch traveller user profile for name
      const userResult = await userService.getUser(travellerUserId, accessToken);
      const travellerName = userResult.data
        ? `${userResult.data.firstName} ${userResult.data.lastName}`.trim()
        : "Your Traveller";

      setMatchData({
        travellerUserId,
        travellerName,
        tripRoute: `${shipment.travel.originCity} - ${shipment.travel.destinationCity}`,
        travelDate: new Date(shipment.travel.departureAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        remainingSpace: `${shipment.package.weightKg}kgs`,
      });
      setLoading(false);
    };

    fetchMatch();
  }, [packageId, accessToken]);

  const handleChat = () => {
    if (!matchData) return;
    const conversationId = [userId, matchData.travellerUserId].sort().join("_");
    router.push({
      pathname: "/(chat)/[conversationId]",
      params: {
        conversationId,
        receiverId: matchData.travellerUserId,
        receiverName: matchData.travellerName,
      },
    });
  };

  const displayName = matchData?.travellerName ?? "Traveller";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traveller Match Details</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.card}>
            {/* Traveller profile row */}
            <View style={styles.profileRow}>
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name="star" size={10} color="#FFCB45" />
                  ))}
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={28} color="#32BF5B" />
            </View>

            <View style={styles.divider} />

            {/* Row 1 */}
            <View style={styles.detailsRow}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Trip Details :</Text>
                <Text style={styles.detailValue}>{matchData?.tripRoute ?? "—"}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Your Item :</Text>
                <Text style={styles.detailValue}>{itemName ?? "—"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row 2 */}
            <View style={styles.detailsRow}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Remaining Seats / Space :</Text>
                <Text style={styles.detailValue}>{matchData?.remainingSpace ?? "—"}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Travel Date :</Text>
                <Text style={styles.detailValue}>{matchData?.travelDate ?? "—"}</Text>
              </View>
            </View>

            {/* Chat button */}
            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
              <Text style={styles.chatButtonText}>
                Chat with {displayName.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#111",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 19,
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#111",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },
  detailsRow: {
    flexDirection: "row",
  },
  detailCell: {
    flex: 1,
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    lineHeight: 16,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#111",
  },
  chatButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 100,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  chatButtonText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "#fff",
    letterSpacing: -0.12,
  },
  errorText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: 40,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default TravellerMatchDetailsScreen;
