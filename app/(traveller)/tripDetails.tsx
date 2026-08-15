import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { travellerService, TripDetails } from "@/services/travellerService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TripDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams<{ tripId?: string; matchedShipmentId?: string }>();
  const tripId = params.tripId || "";
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [matchedShipmentId, setMatchedShipmentId] = useState<string | null>(
    params.matchedShipmentId || null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTrip = useCallback(async () => {
    if (!tripId || !accessToken) return;

    setIsRefreshing(true);
    setErrorMessage(null);

    const result = await travellerService.findTrip(tripId, accessToken);
    setIsRefreshing(false);

    if (!result.ok || !result.data) {
      setErrorMessage(result.error || "Unable to load trip.");
      return;
    }

    setTrip(result.data);

    if (!params.matchedShipmentId) {
      const shipmentsResult = await travellerService.findShipmentsByTrip(tripId, accessToken, 1, 1);
      if (shipmentsResult.ok && shipmentsResult.data?.data?.[0]) {
        setMatchedShipmentId(shipmentsResult.data.data[0].id);
      }
    }
  }, [accessToken, tripId, params.matchedShipmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchTrip();
    }, [fetchTrip])
  );

  const handleViewShipment = () => {
    if (!matchedShipmentId) return;
    router.push({
      pathname: "/(traveller)/shipmentDetails",
      params: { id: matchedShipmentId, shipmentId: matchedShipmentId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismissTo("/(tabs)/shipments")} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {isRefreshing && !trip ? (
            <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />
          ) : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {trip ? (
            <>
              <View style={styles.tripRow}>
                <View style={styles.tripIcon}>
                  <Ionicons name="airplane-outline" size={22} color={Theme.colors.primary} />
                </View>
                <View style={styles.tripText}>
                  <Text style={styles.tripTitle}>
                    {trip.originCity} → {trip.destinationCity}
                  </Text>
                  <Text style={styles.tripMode}>{trip.mode}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: matchedShipmentId ? Theme.colors.lightGreen : Theme.colors.background.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: matchedShipmentId ? Theme.colors.primary : Theme.colors.text.gray },
                    ]}
                  >
                    {matchedShipmentId ? "Matched" : "Unmatched"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Status :</Text>
                  <Text style={styles.detailValue}>{trip.status}</Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Max Weight :</Text>
                  <Text style={styles.detailValue}>{trip.maxWeightKg} kg</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Departure :</Text>
                  <Text style={styles.detailValue}>
                    {new Date(trip.departureAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Arrival :</Text>
                  <Text style={styles.detailValue}>
                    {new Date(trip.arrivalAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {matchedShipmentId ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.primaryButton}
                  onPress={handleViewShipment}
                >
                  <Text style={styles.primaryButtonText}>View Shipment</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.waitingNotice}>
                  <Text style={styles.waitingNoticeText}>
                    Waiting to be matched by a sender.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 96,
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
    paddingBottom: 112,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: Theme.spacing.md,
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loader: {
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.error,
    marginBottom: Theme.spacing.md,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  tripIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EBF2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  tripText: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  tripMode: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
  },
  detailRow: {
    flexDirection: "row",
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginVertical: Theme.spacing.md,
  },
  primaryButton: {
    height: 45,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.xl,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
  waitingNotice: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },
  waitingNoticeText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
});

export default TripDetailsScreen;
