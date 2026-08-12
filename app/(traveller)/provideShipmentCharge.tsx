import CustomButton from "@/components/ui/CustomButton";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService, ShipmentDetails } from "@/services/senderService";
import { formatMoney } from "@/utils/formatting";
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

const ProvideShipmentChargeScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams<{ shipmentId?: string }>();
  const shipmentId = params.shipmentId ?? "";

  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!shipmentId || !accessToken) {
        setLoadError("Missing shipment or session.");
        setLoading(false);
        return;
      }
      const result = await senderService.getShipment(shipmentId, accessToken);
      if (!result.ok || !result.data) {
        setLoadError(result.error || "Unable to load shipment.");
        setLoading(false);
        return;
      }
      setShipment(result.data);
      setLoading(false);
    };
    void load();
  }, [accessToken, shipmentId]);

  const onConfirm = async () => {
    if (!shipment || !accessToken || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await senderService.travellerConfirmShipment(shipment.id, accessToken);
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error || "Unable to confirm transport. Please try again.");
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={25} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm transport</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} />
        ) : loadError ? (
          <Text style={styles.errorText}>{loadError}</Text>
        ) : shipment ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{shipment.package.name}</Text>
              <Text style={styles.meta}>
                {shipment.package.originCity} → {shipment.package.destinationCity}
              </Text>
              <Text style={styles.meta}>Weight: {shipment.package.weightKg} kg</Text>
              <Text style={styles.meta}>Category: {shipment.package.category}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payout</Text>
              <Text style={styles.amount}>
                {formatMoney(shipment.priceMinor, shipment.currency)}
              </Text>
              <Text style={styles.helperText}>
                This is the amount you will receive after the sender pays and delivery is confirmed.
              </Text>
            </View>

            <Text style={styles.helperText}>
              By confirming, you agree to carry this shipment. The sender will then be able to pay.
            </Text>

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            <CustomButton
              title="Confirm I can transport this"
              variant="primary"
              onPress={onConfirm}
              loading={submitting}
              disabled={submitting}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "600",
    color: Theme.colors.text.dark,
  },
  scrollContent: { padding: Theme.spacing.md, paddingBottom: Theme.spacing.xl },
  card: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "600",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  meta: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontFamily: "Inter-Regular",
    fontWeight: "700",
    color: Theme.colors.primary,
    marginVertical: Theme.spacing.sm,
  },
  helperText: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default ProvideShipmentChargeScreen;
