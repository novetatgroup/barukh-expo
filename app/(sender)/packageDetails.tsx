import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { Package, senderService } from "@/services/senderService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PackageDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams<{
    packageId?: string;
    senderId?: string;
    matchedShipmentId?: string;
  }>();
  const packageId = params.packageId || "";
  const [pkg, setPackage] = useState<Package | null>(null);
  const [matchedShipmentId, setMatchedShipmentId] = useState<string | null>(
    params.matchedShipmentId || null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    if (!packageId || !accessToken) return;

    setIsRefreshing(true);
    setErrorMessage(null);

    const result = await senderService.getPackage(packageId, accessToken);
    setIsRefreshing(false);

    if (!result.ok || !result.data) {
      setErrorMessage(result.error || "Unable to load package.");
      return;
    }

    setPackage(result.data);

    if (!params.matchedShipmentId) {
      const shipmentsResult = await senderService.findShipmentsByPackage(packageId, accessToken, 1, 1);
      if (shipmentsResult.ok && shipmentsResult.data?.data?.[0]) {
        setMatchedShipmentId(shipmentsResult.data.data[0].id);
      }
    }
  }, [accessToken, packageId, params.matchedShipmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchPackage();
    }, [fetchPackage])
  );

  const handleGetMatched = () => {
    router.push({
      pathname: "/(sender)/findingTraveller",
      params: { packageId, senderId: params.senderId || pkg?.senderId || "" },
    });
  };

  const handleTrackShipment = () => {
    if (!matchedShipmentId) return;
    router.push({
      pathname: "/(sender)/shipmentDetails",
      params: { id: matchedShipmentId, shipmentId: matchedShipmentId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismissTo("/(tabs)/shipments")} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {isRefreshing && !pkg ? (
            <ActivityIndicator color={Theme.colors.primary} style={styles.loader} />
          ) : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {pkg ? (
            <>
              {pkg.photoUrl ? (
                <Image source={{ uri: pkg.photoUrl }} style={styles.photo} resizeMode="cover" />
              ) : null}

              <View style={styles.packageRow}>
                <View style={styles.packageIcon}>
                  <Ionicons name="cube-outline" size={22} color={Theme.colors.primary} />
                </View>
                <View style={styles.packageText}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: matchedShipmentId ? Theme.colors.lightGreen : Theme.colors.orange },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: matchedShipmentId ? Theme.colors.primary : Theme.colors.white },
                    ]}
                  >
                    {matchedShipmentId ? "Matched" : "Unmatched"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>From :</Text>
                  <Text style={styles.detailValue}>
                    {pkg.originCity}, {pkg.originCountry}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>To :</Text>
                  <Text style={styles.detailValue}>
                    {pkg.destinationCity}, {pkg.destinationCountry}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Weight :</Text>
                  <Text style={styles.detailValue}>{pkg.weightKg} kg</Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Quantity :</Text>
                  <Text style={styles.detailValue}>{pkg.quantity}</Text>
                </View>
              </View>

              {matchedShipmentId ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.primaryButton}
                  onPress={handleTrackShipment}
                >
                  <Text style={styles.primaryButtonText}>Track Shipment</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.primaryButton}
                  onPress={handleGetMatched}
                >
                  <Text style={styles.primaryButtonText}>Get Matched</Text>
                </TouchableOpacity>
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
  photo: {
    width: "100%",
    height: 160,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background.secondary,
    marginBottom: Theme.spacing.md,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  packageIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  packageText: {
    flex: 1,
  },
  packageName: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
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
});

export default PackageDetailsScreen;
