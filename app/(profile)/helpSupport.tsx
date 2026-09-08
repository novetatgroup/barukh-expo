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
import { useImageUpload } from "@/hooks/useImageUpload";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_ATTACHMENTS = 5;

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

  const attachments = useImageUpload();
  const nextSlotIndex = useRef(0);

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

  const addAttachmentFromLibrary = () => {
    if (attachments.images.length >= MAX_ATTACHMENTS) return;
    attachments.pickFromLibrary(`attachment-${nextSlotIndex.current++}`);
  };

  const addAttachmentFromCamera = () => {
    if (attachments.images.length >= MAX_ATTACHMENTS) return;
    attachments.takePhoto(`attachment-${nextSlotIndex.current++}`);
  };

  const onSubmit = async () => {
    if (!canSubmit || !reason) return;
    if (!accessToken) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let attachmentUrls: string[] = [];

    if (attachments.images.length > 0) {
      const uploadUrlsResult = await userService.getComplaintAttachmentUploadUrls(
        attachments.images.length,
        accessToken
      );

      if (!uploadUrlsResult.ok || !uploadUrlsResult.data) {
        setSubmitting(false);
        setError(uploadUrlsResult.error || "Could not prepare your attachments. Please try again.");
        return;
      }

      const presignedSlots = uploadUrlsResult.data.urls;
      attachments.images.forEach((image, index) => {
        attachments.startUpload(image.slot, presignedSlots[index].uploadUrl);
      });
      attachmentUrls = presignedSlots.map(slot => slot.key);

      try {
        await attachments.waitForAllUploads();
      } catch {
        setSubmitting(false);
        setError("One or more attachments failed to upload. Please try again.");
        return;
      }
    }

    const { ok, error: submitError } = await userService.submitComplaint(
      {
        type,
        reason,
        details: details.trim(),
        attachmentUrls,
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

        <Text style={styles.label}>Attachments (optional)</Text>
        <View style={styles.attachmentsRow}>
          {attachments.images.map(image => (
            <View key={image.slot} style={styles.attachmentThumbWrap}>
              <Image source={{ uri: image.uri }} style={styles.attachmentThumb} />
              <TouchableOpacity
                style={styles.removeAttachmentButton}
                onPress={() => attachments.removeImage(image.slot)}
                accessibilityLabel="Remove attachment"
              >
                <Ionicons name="close-circle" size={20} color={Theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {attachments.images.length < MAX_ATTACHMENTS ? (
            <>
              <TouchableOpacity
                style={styles.addAttachmentButton}
                onPress={addAttachmentFromLibrary}
                accessibilityLabel="Add photo from library"
              >
                <Ionicons name="image-outline" size={22} color={Theme.colors.text.gray} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addAttachmentButton}
                onPress={addAttachmentFromCamera}
                accessibilityLabel="Take a photo"
              >
                <Ionicons name="camera-outline" size={22} color={Theme.colors.text.gray} />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Submit complaint"
          variant="primary"
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={submitting || attachments.isUploading}
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
  attachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  attachmentThumbWrap: {
    width: 64,
    height: 64,
    position: "relative",
  },
  attachmentThumb: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.md,
  },
  removeAttachmentButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
  },
  addAttachmentButton: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: Theme.colors.error,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 8,
  },
});

export default HelpSupportScreen;
