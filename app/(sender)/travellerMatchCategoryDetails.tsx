import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TravellerMatchCategoryDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const travellerName = (params.travellerName as string) || "Traveller";
  const route = (params.route as string) || "Ontario - Kampala";
  const rating = (params.rating as string) || "5.0";
  const remainingSpace = (params.remainingSpace as string) || "45kgs";
  const travelDate = (params.travelDate as string) || "23 Sept 2025";
  const initials = travellerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);


  const handleConfirm = () => {
    router.push({
      pathname: "/(sender)/modeOfPayment",
      params: {
        shipmentCost: "$120",
        insurance: "$3.20",
        total: "$123.20",
        payAmount: "$48.20",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Traveller Match Details</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Theme.colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.profileText}>
              <Text style={styles.travellerName}>{travellerName}</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={13}
                    color="#FFCB45"
                    style={styles.starIcon}
                  />
                ))}
                <Text style={styles.ratingText}>{rating}</Text>
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

          <View style={styles.detailsBlock}>
            <Text style={styles.detailLabel}>Trip Details :</Text>
            <Text style={styles.routeText}>{route}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Remaining Seats / Space :</Text>
              <Text style={styles.detailValue}>{remainingSpace}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Travel Date :</Text>
              <Text style={styles.detailValue}>{travelDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 112,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 22,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
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
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5D6A8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  profileText: {
    flex: 1,
  },
  travellerName: {
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
  detailsBlock: {
    marginBottom: Theme.spacing.md,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginBottom: 7,
  },
  routeText: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginBottom: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: Theme.spacing.md,
  },
  detailCell: {
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginTop: 2,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 0.42,
    backgroundColor: "#7A7A7A",
  },
  confirmButton: {
    flex: 0.58,
    backgroundColor: Theme.colors.primary,
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default TravellerMatchCategoryDetailsScreen;
