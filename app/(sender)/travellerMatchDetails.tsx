import { Theme } from "@/constants/Theme";
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
  const { accessToken } = useContext(AuthContext);
  const { shipmentId, itemName } = useLocalSearchParams<{
    shipmentId?: string;
    packageId: string;
    itemName: string;
  }>();

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        setError("Please sign in to view this traveller match.");
        setLoading(false);
        return;
      }

      if (!shipmentId) {
        setError("No traveller matched to this package yet.");
        setLoading(false);
        return;
      }

      const shipmentResult = await senderService.getShipment(shipmentId, accessToken);
      if (!shipmentResult.ok || !shipmentResult.data) {
        setError("No traveller matched to this package yet.");
        setLoading(false);
        return;
      }

      const shipment = shipmentResult.data;
      const travellerUserId = shipment.traveller.userId;

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
  }, [shipmentId, accessToken]);

  const displayItemName = itemName || "Macbook Pro";

  const handleMakePayment = () => {
    router.push({
      pathname: "/(sender)/modeOfPayment",
      params: {
        shipmentId: shipmentId || "",
        itemName: displayItemName,
        shipmentCost: "$120",
        insurance: "$3.20",
        total: "$123.20",
        payAmount: "$48.20",
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traveller Match Details</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Theme.colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={13}
                      color="#FFCB45"
                      style={styles.starIcon}
                    />
                  ))}
                  <Text style={styles.ratingText}>5.0</Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={Theme.colors.white}
                />
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Trip Details :</Text>
                <Text style={styles.detailValue}>{matchData?.tripRoute ?? "—"}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Your Item :</Text>
                <Text style={styles.detailValue}>{displayItemName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

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

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.paymentButton}
              onPress={handleMakePayment}
            >
              <Text style={styles.paymentButtonText}>Make Payment</Text>
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 104,
    paddingBottom: Theme.spacing.xl,
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  body: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  profileInfo: {
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginLeft: 5,
  },
  verifiedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginVertical: Theme.spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginBottom: 7,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  paymentButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Theme.spacing.sm,
  },
  paymentButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
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
