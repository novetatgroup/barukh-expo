import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { extractShipmentsList, Package, senderService, ShipmentDetails } from "@/services/senderService";
import { Trip, travellerService } from "@/services/travellerService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MatchStatusBadge = ({ matched, allowsAction }: { matched: boolean; allowsAction: boolean }) => (
  <View
    style={[
      styles.statusBadge,
      {
        backgroundColor: matched
          ? Theme.colors.lightGreen
          : allowsAction
            ? Theme.colors.orange
            : Theme.colors.background.border,
      },
    ]}
  >
    <Text
      style={[
        styles.statusBadgeText,
        {
          color: matched
            ? Theme.colors.primary
            : allowsAction
              ? Theme.colors.white
              : Theme.colors.text.gray,
        },
      ]}
    >
      {matched ? "Matched" : "Unmatched"}
    </Text>
  </View>
);

const SenderPackagesList = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const [packages, setPackages] = useState<Package[]>([]);
  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!userId || !accessToken) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    setLoading(true);
    setError(null);

    const packagesResult = await senderService.getPackages(userId, accessToken);
    if (!packagesResult.ok || !packagesResult.data) {
      setPackages([]);
      setShipments([]);
      setError(packagesResult.error || "Unable to load packages.");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    let shipmentsList: ShipmentDetails[] = [];
    const senderResult = await senderService.getSender(userId, accessToken);
    if (senderResult.ok && senderResult.data?.senderId) {
      const shipmentsResult = await senderService.getSenderShipments(
        senderResult.data.senderId,
        accessToken
      );
      if (shipmentsResult.ok && shipmentsResult.data) {
        shipmentsList = extractShipmentsList(shipmentsResult.data);
      }
    }

    // Set together so packages never render with a not-yet-resolved match status.
    setPackages(packagesResult.data.data);
    setShipments(shipmentsList);
    setLoading(false);
    setInitialLoad(false);
  }, [userId, accessToken]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My <Text style={styles.highlight}>Packages</Text>
      </Text>

      {initialLoad ? (
        <View style={styles.listLoader}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchPackages}
          renderItem={({ item }) => {
            const matchedShipment = shipments.find((shipment) => shipment.packageId === item.id);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(sender)/packageDetails",
                    params: {
                      packageId: item.id,
                      senderId: item.senderId,
                      matchedShipmentId: matchedShipment?.id || "",
                    },
                  })
                }
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: Theme.colors.yellow }]}>
                  <Ionicons name="cube-outline" size={22} color={Theme.colors.primary} />
                </View>

                <View style={styles.cardText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>
                    {item.originCity} → {item.destinationCity}
                  </Text>
                </View>

                <View style={styles.metaContainer}>
                  <MatchStatusBadge matched={!!matchedShipment} allowsAction />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={36} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>{error || "No packages found."}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const TravellerTripsList = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    setLoading(true);
    setError(null);

    const tripsResult = await travellerService.getTrips(accessToken);
    if (!tripsResult.ok || !tripsResult.data) {
      setTrips([]);
      setShipments([]);
      setError(tripsResult.error || "Unable to load trips.");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    let shipmentsList: ShipmentDetails[] = [];
    const travellerResult = await travellerService.getTraveller(accessToken);
    if (travellerResult.ok && travellerResult.data?.travellerId) {
      const shipmentsResult = await travellerService.getTravellerShipments(
        travellerResult.data.travellerId,
        accessToken
      );
      if (shipmentsResult.ok && shipmentsResult.data) {
        shipmentsList = extractShipmentsList(shipmentsResult.data);
      }
    }

    // Set together so trips never render with a not-yet-resolved match status.
    setTrips(tripsResult.data.data);
    setShipments(shipmentsList);
    setLoading(false);
    setInitialLoad(false);
  }, [accessToken]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My <Text style={styles.highlight}>Trips</Text>
      </Text>

      {initialLoad ? (
        <View style={styles.listLoader}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchTrips}
          renderItem={({ item }) => {
            const matchedShipment = shipments.find((shipment) => shipment.tripId === item.id);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(traveller)/tripDetails",
                    params: { tripId: item.id, matchedShipmentId: matchedShipment?.id || "" },
                  })
                }
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: "#EBF2F1" }]}>
                  <Ionicons name="airplane-outline" size={22} color={Theme.colors.primary} />
                </View>

                <View style={styles.cardText}>
                  <Text style={styles.name}>
                    {item.originCity || item.originCountry} → {item.destinationCity || item.destinationCountry}
                  </Text>
                  <Text style={styles.item}>{item.mode}</Text>
                  <Text style={styles.detail}>{item.status}</Text>
                </View>

                <View style={styles.metaContainer}>
                  <MatchStatusBadge matched={!!matchedShipment} allowsAction={false} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="airplane-outline" size={36} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>{error || "No trips found."}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const ShipmentsScreen = () => {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return role === "TRAVELLER" ? <TravellerTripsList /> : <SenderPackagesList />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Theme.spacing.xxxl,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Regular",
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
    color: Theme.colors.text.dark,
  },
  highlight: {
    color: Theme.colors.text.dark,
    fontFamily: "Inter-Bold",
  },
  listContent: {
    paddingBottom: 100,
  },
  listLoader: {
    paddingTop: Theme.spacing.xxl,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: Theme.colors.text.dark,
    marginBottom: 2,
  },
  item: {
    color: Theme.colors.text.gray,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    marginBottom: 2,
  },
  detail: {
    color: Theme.colors.text.lightGray,
    fontSize: 11,
    fontFamily: "Inter-Regular",
  },
  metaContainer: {
    alignItems: "flex-end",
    maxWidth: 104,
  },
  statusBadge: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.xxl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.background.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default ShipmentsScreen;
