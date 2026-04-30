import { PackagePattern } from "@/assets/svgs";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { Trip, TripDetails, travellerService } from "@/services/travellerService";
import { UserProfile, userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const TravellerHomeContent = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tripDetailsCache, setTripDetailsCache] = useState<Record<string, TripDetails>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !accessToken) return;
      const { data, ok } = await userService.getUser(userId, accessToken);
      if (ok && data) {
        setUserProfile(data);
      }
    };
    fetchUser();
  }, [userId, accessToken]);

  const fetchTrips = useCallback(async () => {
    if (!userId || !accessToken) {
      setTripsLoading(false);
      return;
    }

    setTripsLoading(true);
    const { data, ok } = await travellerService.getTrips(userId, accessToken);
    if (ok && data) {
      setTrips(data.data);
    }
    setTripsLoading(false);
  }, [userId, accessToken]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const userName = userProfile?.firstName || "User";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return { badge: styles.pending, text: styles.pendingText };
      case "In Transit":
        return { badge: styles.inTransit, text: styles.inTransitText };
      case "Delivered":
        return { badge: styles.delivered, text: styles.deliveredText };
      default:
        return { badge: styles.pending, text: styles.pendingText };
    }
  };

  const handleNavigateToShipments = (tab?: string) => {
    router.push({
      pathname: "/(tabs)/shipments",
      params: { tab: tab || "All" },
    });
  };

  const handleExpand = async (tripId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === tripId ? null : tripId);

    if (!tripDetailsCache[tripId] && accessToken) {
      const { data, ok } = await travellerService.findTrip(tripId, accessToken);
      if (ok && data) {
        setTripDetailsCache((prev) => ({ ...prev, [tripId]: data }));
      }
    }
  };

  const handleCreateTrip = () => {
    if (!userProfile?.isActive) {
      router.push("/(KYC)/KYCLanding");
      return;
    }
    router.push("/(traveller)/packageDetails");
  };

  const listHeader = (
    <>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.patternOverlay}>
          <PackagePattern />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.userRow}>
            <Image
              source={require("@/assets/images/avatar.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>Welcome Back !</Text>
              <Text style={styles.userName}>Hi {userName}</Text>
            </View>
            <TouchableOpacity style={styles.bellIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Theme.colors.white}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.myShipmentsTitle}>My Trips</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search trips"
              placeholderTextColor="#FFFFFF80"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.actionButton, styles.sendPackageButton]}
          onPress={handleCreateTrip}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add" size={24} />
          </View>
          <Text style={styles.actionButtonText}>Create a trip</Text>
        </TouchableOpacity>
      </View>

      {/* Trips Section Header */}
      <View style={styles.shipmentHeader}>
        <Text style={styles.shipmentTitle}>My Trips</Text>
        <TouchableOpacity onPress={() => handleNavigateToShipments("All")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.content}>
      <FlatList
        onRefresh={fetchTrips}
        refreshing={tripsLoading}
        data={trips}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          tripsLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="airplane-outline" size={48} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptySubtext}>
                You haven&apos;t created any trips. Tap the button above to get started.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const tripNumber = `#${item.id.substring(0, 8).toUpperCase()}`;
          const isExpanded = expandedId === item.id;
          const statusStyle = getStatusStyle(item.status);
          const details = tripDetailsCache[item.id];
          const from = details ? `${details.originCity}, ${details.originCountry}` : null;
          const to = details ? `${details.destinationCity}, ${details.destinationCountry}` : null;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.shipmentCard}
              onPress={() => handleExpand(item.id)}
            >
              <View style={styles.shipmentCardRow}>
                <View style={styles.packageIconContainer}>
                  <Ionicons name="airplane-outline" size={24} color={Theme.colors.primary} />
                </View>
                <View style={styles.shipmentInfo}>
                  <Text style={styles.trackingNumber}>{tripNumber}</Text>
                  {from && to && (
                    <Text style={styles.shipmentItem}>{from} → {to}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, statusStyle.badge]}>
                  <Text style={[styles.statusText, statusStyle.text]}>{item.status}</Text>
                </View>
              </View>

              {isExpanded && (
                <>
                  <View style={styles.accordionDivider} />
                  {!details ? (
                    <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginVertical: 8 }} />
                  ) : (
                    <>
                      <View style={styles.accordionGrid}>
                        <View style={styles.accordionCell}>
                          <Text style={styles.accordionLabel}>From :</Text>
                          <Text style={styles.accordionValue}>{from}</Text>
                        </View>
                        <View style={styles.accordionCell}>
                          <Text style={styles.accordionLabel}>To :</Text>
                          <Text style={styles.accordionValue}>{to}</Text>
                        </View>
                      </View>
                      <View style={styles.accordionDivider} />
                      <View style={styles.accordionGrid}>
                        <View style={styles.accordionCell}>
                          <Text style={styles.accordionLabel}>Mode :</Text>
                          <Text style={styles.accordionValue}>{details.mode}</Text>
                        </View>
                        <View style={styles.accordionCell}>
                          <Text style={styles.accordionLabel}>Departure :</Text>
                          <Text style={styles.accordionValue}>
                            {new Date(details.departureAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xxxxl,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    overflow: "hidden",
    position: "relative",
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    right: -20,
    width: 220,
    height: 260,
  },
  headerContent: {
    zIndex: 1,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Theme.spacing.md,
    backgroundColor: Theme.colors.secondary,
  },
  bellIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    padding: Theme.spacing.sm,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  welcomeText: {
    color: "#CED1D8",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  userName: {
    color: Theme.colors.white,
    fontSize: 21,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    letterSpacing: -1,
  },
  myShipmentsTitle: {
    color: Theme.colors.white,
    fontSize: 30,
    fontFamily: "Inter-Bold",
    lineHeight: 36,
    letterSpacing: -2,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#282828",
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.white,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  qrButton: {
    padding: Theme.spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
  },
  sendPackageButton: {
    backgroundColor: "#C7F530",
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.sm,
  },
  actionButtonText: {
    color: "#163330",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  shipmentTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  seeAll: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  listContent: {
    paddingBottom: 100,
  },
  shipmentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionDivider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginVertical: 14,
  },
  accordionGrid: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  accordionCell: {
    flex: 1,
    gap: 6,
  },
  accordionLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  accordionValue: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  packageIconContainer: {
    backgroundColor: "#C7F530",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  shipmentInfo: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.black,
    marginBottom: 2,
  },
  shipmentItem: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  pending: {
    backgroundColor: "#9CA3AF",
  },
  inTransit: {
    backgroundColor: "#7856D3",
  },
  delivered: {
    backgroundColor: "#32BF5B",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  pendingText: {
    color: Theme.colors.white,
  },
  inTransitText: {
    color: Theme.colors.white,
  },
  deliveredText: {
    color: Theme.colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EBF2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
});

export default TravellerHomeContent;
