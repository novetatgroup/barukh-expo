import CustomButton from "@/components/ui/CustomButton";
import CustomTextInput from "@/components/ui/CustomTextInput";
import Theme from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { senderService } from "@/services/senderService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  counterpartyLabel: "traveller" | "sender";
};

const RateCounterpartyForm = ({ counterpartyLabel }: Props) => {
  const router = useRouter();
  const { accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams<{ shipmentId?: string }>();
  const shipmentId = params.shipmentId ?? "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    if (!accessToken) {
      setError("Your session is unavailable. Please log in again.");
      return;
    }
    if (!shipmentId) {
      setError("Missing shipment reference.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await senderService.submitReview(
      { shipmentId, rating, comment: comment.trim() },
      accessToken,
    );
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Could not submit review. Please try again.");
      return;
    }
    router.back();
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
        <Text style={styles.headerTitle}>Rate the {counterpartyLabel}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.helperText}>
          How was your experience with the {counterpartyLabel}?
        </Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              accessibilityLabel={`Rate ${star} out of 5`}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={40}
                color={star <= rating ? Theme.colors.yellow : Theme.colors.text.lightGray}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Comment</Text>
        <CustomTextInput
          placeholder="Share what went well or where they can improve"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          variant="compact"
          style={styles.commentInput}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Submit review"
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
    textAlign: "center",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  starButton: { padding: 4 },
  label: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    fontWeight: "500",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  commentInput: {
    minHeight: 120,
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

export default RateCounterpartyForm;
