import CustomButton from "@/components/ui/CustomButton";
import CustomTextInput from "@/components/ui/CustomTextInput";
import CustomDropdown from "@/components/ui/Dropdown";
import {
  COMPLAINT_REASON_OPTIONS,
  COMPLAINT_TYPE_OPTIONS,
  COMPLAINT_TYPES,
  ComplaintReason,
  ComplaintType,
} from "@/constants/complaints";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const REFERENCE_FIELD_BY_TYPE: Partial<Record<ComplaintType, {
  key: "shipmentReferenceNumber" | "travellerReferenceNumber" | "senderReferenceNumber";
  label: string;
  placeholder: string;
}>> = {
  [COMPLAINT_TYPES.SHIPMENT]: {
    key: "shipmentReferenceNumber",
    label: "Shipment reference number",
    placeholder: "e.g. SHP-12345",
  },
  [COMPLAINT_TYPES.TRAVELLER]: {
    key: "travellerReferenceNumber",
    label: "Traveller reference number",
    placeholder: "e.g. TRV-12345",
  },
  [COMPLAINT_TYPES.SENDER]: {
    key: "senderReferenceNumber",
    label: "Sender reference number",
    placeholder: "e.g. SND-12345",
  },
};

const HelpSupportScreen = () => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);

  const [type, setType] = useState<ComplaintType>(COMPLAINT_TYPES.OTHER);
  const [reason, setReason] = useState<ComplaintReason | null>(null);
  const [details, setDetails] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referenceField = REFERENCE_FIELD_BY_TYPE[type];

  const canSubmit =
    !!reason &&
    details.trim().length >= 10 &&
    (!referenceField || referenceNumber.trim().length > 0) &&
    !submitting;

  const onTypeChange = (value: string) => {
    setType(value as ComplaintType);
    setReferenceNumber("");
  };

  const onSubmit = async () => {
    if (!canSubmit || !reason) return;
    if (!accessToken) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { ok, error: submitError } = await userService.submitComplaint(
      {
        type,
        reason,
        details: details.trim(),
        attachmentUrls: [],
        ...(referenceField ? { [referenceField.key]: referenceNumber.trim() } : {}),
      },
      accessToken
    );

    setSubmitting(false);

    if (!ok) {
      setError(submitError || "Could not submit your complaint. Please try again.");
      return;
    }

    Alert.alert(
      "Complaint submitted",
      "Thanks for letting us know. Our support team will review your complaint and follow up.",
      [{ text: "OK", onPress: () => router.back() }]
    );
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.helperText}>
          File a complaint and our support team will review it and reach out to you.
        </Text>

        <Text style={styles.label}>What is this complaint about?</Text>
        <CustomDropdown
          value={type}
          options={COMPLAINT_TYPE_OPTIONS}
          onSelect={onTypeChange}
        />

        <Text style={styles.label}>Reason</Text>
        <CustomDropdown
          value={reason ?? undefined}
          options={COMPLAINT_REASON_OPTIONS}
          onSelect={(value) => setReason(value as ComplaintReason)}
          placeholder="Select a reason"
        />

        {referenceField ? (
          <>
            <Text style={styles.label}>{referenceField.label}</Text>
            <CustomTextInput
              placeholder={referenceField.placeholder}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              variant="compact"
              autoCapitalize="characters"
            />
          </>
        ) : null}

        <Text style={styles.label}>Details</Text>
        <CustomTextInput
          placeholder="Describe what happened (at least 10 characters)"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={6}
          variant="compact"
          style={styles.detailsInput}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Submit complaint"
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
  detailsInput: {
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

export default HelpSupportScreen;
