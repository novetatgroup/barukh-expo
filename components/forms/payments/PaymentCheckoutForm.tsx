import { Theme } from "@/constants/Theme";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { ShipmentDetails } from "@/services/senderService";
import {
  MaskedSavedCard,
  PaymentAdditionalField,
  PaymentChallenge,
  PaymentStatus,
} from "@/types/payment";
import { formatMoney } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentCheckoutFormProps = ReturnType<typeof usePaymentCheckout>;

const additionalFieldLabels: Record<PaymentAdditionalField, string> = {
  billingZip: "Billing postal code",
  billingCity: "Billing city",
  billingAddress: "Billing address",
  billingState: "Billing state / region",
  billingCountry: "Billing country",
};

type StatusPresentation = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  copy: string;
  color: string;
};

const STATUS_PRESENTATION: Record<PaymentStatus, StatusPresentation> = {
  CAPTURED: {
    icon: "checkmark-circle",
    title: "Payment captured",
    copy: "The backend-confirmed payment is complete.",
    color: Theme.colors.success,
  },
  FAILED: {
    icon: "close-circle",
    title: "Payment declined",
    copy: "The payment was not captured. No real retry is offered without confirmed retry rules.",
    color: Theme.colors.error,
  },
  CANCELLED: {
    icon: "remove-circle",
    title: "Payment cancelled",
    copy: "The payment was cancelled and no success state was recorded.",
    color: Theme.colors.text.gray,
  },
  REFUNDED: {
    icon: "return-down-back",
    title: "Payment refunded",
    copy: "The captured amount has been marked as refunded by the backend.",
    color: Theme.colors.orange,
  },
  PENDING: {
    icon: "time",
    title: "Payment pending",
    copy: "Confirmation is still in progress. You can leave safely and resume later.",
    color: Theme.colors.orange,
  },
};

const ChallengeForm = ({
  nextAction,
  busy,
  onSubmit,
}: {
  nextAction: NonNullable<PaymentCheckoutFormProps["nextAction"]>;
  busy: boolean;
  onSubmit: (challenge: PaymentChallenge) => Promise<void>;
}) => {
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [additionalFields, setAdditionalFields] = useState<
    Partial<Record<PaymentAdditionalField, string>>
  >({});

  useEffect(() => {
    setPin("");
    setOtp("");
    setAdditionalFields({});
  }, [nextAction.mode]);

  if (nextAction.mode === "REDIRECT_URL") return null;

  const submit = async () => {
    if (nextAction.mode === "PIN") {
      if (pin.length < 4) return;
      const value = pin;
      setPin("");
      await onSubmit({ type: "PIN", pin: value });
      return;
    }

    if (nextAction.mode === "OTP") {
      if (otp.length < 4) return;
      const value = otp;
      setOtp("");
      await onSubmit({ type: "OTP", otp: value });
      return;
    }

    const isComplete = nextAction.requiresAdditionalFields.every(
      (field) => additionalFields[field]?.trim(),
    );
    if (!isComplete) return;
    const values = { ...additionalFields };
    setAdditionalFields({});
    await onSubmit({ type: "ADDITIONAL_FIELDS", additionalFields: values });
  };

  const canSubmit =
    nextAction.mode === "PIN"
      ? pin.length >= 4
      : nextAction.mode === "OTP"
        ? otp.length >= 4
        : nextAction.requiresAdditionalFields.every(
            (field) => additionalFields[field]?.trim(),
          );

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <Text style={styles.sectionTitle}>
        {nextAction.mode === "PIN"
          ? "Enter your card PIN"
          : nextAction.mode === "OTP"
            ? "Enter the bank OTP"
            : "Additional bank details"}
      </Text>
      <Text style={styles.supportingText}>
        This information stays on this screen and is cleared immediately after submission.
      </Text>

      {nextAction.mode === "PIN" ? (
        <TextInput
          value={pin}
          onChangeText={setPin}
          style={styles.input}
          placeholder="PIN"
          placeholderTextColor={Theme.colors.text.lightGray}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel="Card PIN"
        />
      ) : null}

      {nextAction.mode === "OTP" ? (
        <TextInput
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          placeholder="One-time code"
          placeholderTextColor={Theme.colors.text.lightGray}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={8}
          accessibilityLabel="Bank one-time code"
        />
      ) : null}

      {nextAction.mode === "ADDITIONAL_FIELDS"
        ? nextAction.requiresAdditionalFields.map((field) => (
            <View key={field}>
              <Text style={styles.fieldLabel}>{additionalFieldLabels[field]}</Text>
              <TextInput
                value={additionalFields[field] ?? ""}
                onChangeText={(value) =>
                  setAdditionalFields((current) => ({ ...current, [field]: value }))
                }
                style={styles.input}
                placeholder={additionalFieldLabels[field]}
                placeholderTextColor={Theme.colors.text.lightGray}
              />
            </View>
          ))
        : null}

      <TouchableOpacity
        style={[styles.primaryButton, (!canSubmit || busy) && styles.disabledButton]}
        disabled={!canSubmit || busy}
        onPress={() => void submit()}
      >
        {busy ? (
          <ActivityIndicator color={Theme.colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue securely</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const LoadingCard = () => (
  <View style={styles.stateCard}>
    <ActivityIndicator size="large" color={Theme.colors.primary} />
    <Text style={styles.stateText}>Checking shipment and eligibility...</Text>
  </View>
);

const LoadErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View style={styles.stateCard}>
    <Ionicons name="alert-circle-outline" size={38} color={Theme.colors.error} />
    <Text style={styles.stateTitle}>Checkout unavailable</Text>
    <Text style={styles.stateText}>{message}</Text>
    <TouchableOpacity style={styles.secondaryButton} onPress={onRetry}>
      <Text style={styles.secondaryButtonText}>Try again</Text>
    </TouchableOpacity>
  </View>
);

const EligibilityCard = ({
  isKycVerified,
  isAccepted,
  openVerification,
}: {
  isKycVerified: boolean;
  isAccepted: boolean;
  openVerification: () => void;
}) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Payment eligibility</Text>
    <View style={styles.eligibilityRow}>
      <Ionicons
        name={isKycVerified ? "checkmark-circle" : "close-circle"}
        size={21}
        color={isKycVerified ? Theme.colors.success : Theme.colors.error}
      />
      <Text style={styles.eligibilityText}>Identity verification</Text>
      <Text style={styles.eligibilityMeta}>{isKycVerified ? "Verified" : "Required"}</Text>
    </View>
    <View style={styles.eligibilityRow}>
      <Ionicons
        name={isAccepted ? "checkmark-circle" : "time"}
        size={21}
        color={isAccepted ? Theme.colors.success : Theme.colors.orange}
      />
      <Text style={styles.eligibilityText}>Traveller acceptance</Text>
      <Text style={styles.eligibilityMeta}>{isAccepted ? "Accepted" : "Waiting"}</Text>
    </View>
    {!isKycVerified ? (
      <TouchableOpacity style={styles.inlineButton} onPress={openVerification}>
        <Text style={styles.inlineButtonText}>Open verification</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const ShipmentSummaryCard = ({
  shipment,
  formattedAmount,
}: {
  shipment: ShipmentDetails;
  formattedAmount: string;
}) => (
  <View style={styles.card}>
    <View style={styles.summaryHeader}>
      <View>
        <Text style={styles.sectionTitle}>Shipment summary</Text>
        <Text style={styles.supportingText}>Full payment only</Text>
      </View>
      <Text style={styles.amount}>{formattedAmount}</Text>
    </View>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Item</Text>
      <Text style={styles.summaryValue}>{shipment.package.name}</Text>
    </View>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Route</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {shipment.package.originCity} to {shipment.package.destinationCity}
      </Text>
    </View>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Currency</Text>
      <Text style={styles.summaryValue}>{shipment.currency}</Text>
    </View>
    <Text style={styles.holdCopy}>
      Barukh holds the payment while the shipment is in progress. Payout timing varies by bank.
    </Text>
  </View>
);

const SavedCardPicker = ({
  cards,
  selectedCardId,
  setSelectedCardId,
}: {
  cards: MaskedSavedCard[];
  selectedCardId: string;
  setSelectedCardId: (id: string) => void;
}) => {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Saved card</Text>
      {cards.map((card) => {
        const selected = selectedCardId === card.id;
        return (
          <TouchableOpacity
            key={card.id}
            style={[styles.cardOption, selected && styles.cardOptionSelected]}
            onPress={() => setSelectedCardId(card.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="card-outline" size={22} color={Theme.colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                {card.brand} ending {card.last4}
              </Text>
              <Text style={styles.supportingText}>
                Expires {card.expiryMonth}/{card.expiryYear}
                {card.isDefault ? " - Default" : ""}
              </Text>
            </View>
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={21}
              color={selected ? Theme.colors.primary : Theme.colors.text.lightGray}
            />
          </TouchableOpacity>
        );
      })}
      {cards.length === 0 ? (
        <Text style={styles.supportingText}>No card on file yet.</Text>
      ) : null}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(sender)/addPaymentCard")}
      >
        <Text style={styles.secondaryButtonText}>
          {cards.length === 0 ? "Add a card" : "Add another card"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const RedirectPrompt = ({
  returnUri,
  openRedirect,
}: {
  returnUri: string;
  openRedirect: () => Promise<void>;
}) => (
  <View style={styles.card} accessibilityLiveRegion="polite">
    <Text style={styles.sectionTitle}>3DS verification required</Text>
    <Text style={styles.supportingText}>
      The payment reference has been saved. Returning to the app triggers backend reconciliation; redirect parameters never establish success.
    </Text>
    <Text style={styles.returnUri} numberOfLines={2}>
      {returnUri}
    </Text>
    <TouchableOpacity style={styles.primaryButton} onPress={() => void openRedirect()}>
      <Text style={styles.primaryButtonText}>Open secure 3DS</Text>
    </TouchableOpacity>
  </View>
);

const ResultCard = ({
  status,
  reference,
}: {
  status: PaymentStatus;
  reference: string | null;
}) => {
  const presentation = STATUS_PRESENTATION[status];
  return (
    <View style={styles.stateCard} accessibilityLiveRegion="polite">
      <Ionicons name={presentation.icon} size={44} color={presentation.color} />
      <Text style={styles.stateTitle}>{presentation.title}</Text>
      <Text style={styles.stateText}>{presentation.copy}</Text>
      {reference ? <Text style={styles.reference}>Reference: {reference}</Text> : null}
    </View>
  );
};

const ErrorBanner = ({ message }: { message: string }) => (
  <View style={styles.errorBanner} accessibilityLiveRegion="assertive">
    <Ionicons name="alert-circle-outline" size={20} color={Theme.colors.error} />
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

const PayCTA = ({
  blockedReason,
  busy,
  onPay,
  formattedAmount,
}: {
  blockedReason: string | null;
  busy: boolean;
  onPay: () => Promise<void>;
  formattedAmount: string;
}) => (
  <>
    {blockedReason ? <Text style={styles.blockedCopy}>{blockedReason}</Text> : null}
    <TouchableOpacity
      style={[styles.primaryButton, (Boolean(blockedReason) || busy) && styles.disabledButton]}
      disabled={Boolean(blockedReason) || busy}
      onPress={() => void onPay()}
    >
      {busy ? (
        <ActivityIndicator color={Theme.colors.white} />
      ) : (
        <Text style={styles.primaryButtonText}>Pay {formattedAmount}</Text>
      )}
    </TouchableOpacity>
  </>
);

const PaymentCheckoutForm = (props: PaymentCheckoutFormProps) => {
  const {
    shipment,
    cards,
    selectedCardId,
    setSelectedCardId,
    status,
    nextAction,
    uiPhase,
    reference,
    returnUri,
    loading,
    loadError,
    actionError,
    blockedReason,
    isKycVerified,
    isAccepted,
    pay,
    submitChallenge,
    openRedirect,
    reload,
    openVerification,
    back,
  } = props;

  const busy = uiPhase === "submitting" || uiPhase === "recovering";
  const formattedAmount = useMemo(
    () => (shipment ? formatMoney(shipment.priceMinor, shipment.currency) : "--"),
    [shipment],
  );
  const showResult = status && !nextAction;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.headerButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={25} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment payment</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? <LoadingCard /> : null}

        {!loading && loadError ? (
          <LoadErrorCard message={loadError} onRetry={() => void reload()} />
        ) : null}

        {!loading && shipment ? (
          <>
            <EligibilityCard
              isKycVerified={isKycVerified}
              isAccepted={isAccepted}
              openVerification={openVerification}
            />
            <ShipmentSummaryCard shipment={shipment} formattedAmount={formattedAmount} />
            <SavedCardPicker
              cards={cards}
              selectedCardId={selectedCardId}
              setSelectedCardId={setSelectedCardId}
            />

            {nextAction && nextAction.mode !== "REDIRECT_URL" ? (
              <ChallengeForm nextAction={nextAction} busy={busy} onSubmit={submitChallenge} />
            ) : null}

            {nextAction?.mode === "REDIRECT_URL" ? (
              <RedirectPrompt returnUri={returnUri} openRedirect={openRedirect} />
            ) : null}

            {showResult && status ? (
              <ResultCard status={status} reference={reference} />
            ) : null}

            {actionError ? <ErrorBanner message={actionError} /> : null}

            {!nextAction && !showResult ? (
              <PayCTA
                blockedReason={blockedReason}
                busy={busy}
                onPay={pay}
                formattedAmount={formattedAmount}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.secondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.xxxxxl,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.background.secondary,
  },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  scrollView: { flex: 1 },
  content: { padding: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.xxxxxl, gap: Theme.spacing.md },
  card: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, shadowColor: Theme.colors.black, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter-Bold", color: Theme.colors.text.dark, marginBottom: Theme.spacing.sm },
  supportingText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  eligibilityRow: { flexDirection: "row", alignItems: "center", minHeight: 42, gap: Theme.spacing.sm },
  eligibilityText: { flex: 1, fontSize: 14, fontFamily: "Inter-Regular", color: Theme.colors.text.dark },
  eligibilityMeta: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.text.gray },
  inlineButton: { alignSelf: "flex-start", paddingVertical: Theme.spacing.sm },
  inlineButtonText: { fontSize: 13, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  summaryHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  amount: { fontSize: 17, fontFamily: "Inter-Bold", color: Theme.colors.primary, textAlign: "right", flexShrink: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: Theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: Theme.colors.background.border, gap: Theme.spacing.md },
  summaryLabel: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  summaryValue: { flex: 1, fontSize: 13, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark, textAlign: "right" },
  holdCopy: { marginTop: Theme.spacing.md, fontSize: 12, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  cardOption: { minHeight: 64, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Theme.colors.background.border, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  cardOptionSelected: { borderColor: Theme.colors.primary },
  cardIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background.border, marginRight: Theme.spacing.sm },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark, marginBottom: 2 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.text.gray, marginTop: Theme.spacing.sm, marginBottom: Theme.spacing.xs },
  input: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.text.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 15, fontFamily: "Inter-Regular", color: Theme.colors.text.dark, backgroundColor: Theme.colors.white, marginTop: Theme.spacing.sm },
  primaryButton: { minHeight: 54, borderRadius: Theme.borderRadius.xl, backgroundColor: Theme.colors.primary, alignItems: "center", justifyContent: "center", marginTop: Theme.spacing.md, paddingHorizontal: Theme.spacing.md },
  primaryButtonText: { fontSize: 15, fontFamily: "Inter-SemiBold", color: Theme.colors.white, textAlign: "center" },
  disabledButton: { opacity: 0.45 },
  secondaryButton: { minHeight: 48, borderRadius: Theme.borderRadius.xl, borderWidth: 1, borderColor: Theme.colors.primary, alignItems: "center", justifyContent: "center", marginTop: Theme.spacing.md, paddingHorizontal: Theme.spacing.md },
  secondaryButtonText: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  stateCard: { minHeight: 180, backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, alignItems: "center", justifyContent: "center" },
  stateTitle: { fontSize: 17, fontFamily: "Inter-Bold", color: Theme.colors.text.dark, marginTop: Theme.spacing.sm, textAlign: "center" },
  stateText: { fontSize: 13, lineHeight: 19, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, textAlign: "center", marginTop: Theme.spacing.sm },
  reference: { fontSize: 11, fontFamily: "Inter-Regular", color: Theme.colors.text.lightGray, marginTop: Theme.spacing.md, textAlign: "center" },
  errorBanner: { flexDirection: "row", alignItems: "flex-start", gap: Theme.spacing.sm, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.sm, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.error },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.error },
  blockedCopy: { fontSize: 13, lineHeight: 19, fontFamily: "Inter-Regular", color: Theme.colors.text.gray, textAlign: "center", paddingHorizontal: Theme.spacing.md },
  returnUri: { fontSize: 11, fontFamily: "Inter-Regular", color: Theme.colors.text.lightGray, marginTop: Theme.spacing.md },
});

export default PaymentCheckoutForm;
