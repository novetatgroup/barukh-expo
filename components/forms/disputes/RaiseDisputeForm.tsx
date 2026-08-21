import CustomButton from "@/components/ui/CustomButton";
import CustomTextInput from "@/components/ui/CustomTextInput";
import CustomDropdown from "@/components/ui/Dropdown";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const REASONS = ["Not delivered", "Damaged", "Wrong item", "Other"] as const;
type DisputeReason = (typeof REASONS)[number];

const PENDING_DISPUTES_KEY = "barukh:pending-disputes";

type PendingDispute = {
  userId: string;
  shipmentId: string;
  reason: DisputeReason;
  description: string;
  createdAt: string;
};

// TODO(izaiah): swap AsyncStorage persistence for the real dispute endpoint once
// the backend contract lands. Stored payloads should be flushed on next app open.
const RaiseDisputeForm = () => {
  const router = useRouter();
  const { userId } = useContext(AuthContext);
  const params = useLocalSearchParams<{ shipmentId?: string }>();
  const shipmentId = params.shipmentId ?? "";

  const [reason, setReason] = useState<DisputeReason>("Not delivered");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = description.trim().length >= 10 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    if (!userId) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }
    if (!shipmentId) {
      setError("Missing shipment reference.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const existingRaw = await AsyncStorage.getItem(PENDING_DISPUTES_KEY);
      const existing: PendingDispute[] = existingRaw ? JSON.parse(existingRaw) : [];
      const next: PendingDispute = {
        userId,
        shipmentId,
        reason,
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PENDING_DISPUTES_KEY, JSON.stringify([...existing, next]));
      Alert.alert(
        "Dispute received",
        "Support will follow up shortly. Your dispute has been saved and will be forwarded once the dispute service is available.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      setError("Could not save the dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={25} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a dispute</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.helperText}>
          Tell us what went wrong. Support will review your dispute and reach out.
        </Text>

        <Text style={styles.label}>Reason</Text>
        <CustomDropdown
          label="Reason"
          value={reason}
          options={REASONS as unknown as string[]}
          onSelect={(value) => setReason(value as DisputeReason)}
        />

        <Text style={styles.label}>Description</Text>
        <CustomTextInput
          placeholder="Describe the issue (at least 10 characters)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          variant="compact"
          style={styles.descriptionInput}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Submit dispute"
          variant="primary"
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  helperText: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "500",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  descriptionInput: {
    minHeight: 140,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default RaiseDisputeForm;
