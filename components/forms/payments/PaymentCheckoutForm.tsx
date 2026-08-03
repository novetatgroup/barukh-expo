import { Theme } from "@/constants/Theme";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import {
  PaymentAdditionalField,
  PaymentChallenge,
  PaymentMockScenario,
  PaymentStatus,
} from "@/types/payment";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentCheckoutFormProps = ReturnType<typeof usePaymentCheckout>;

const scenarioOptions: { label: string; value: PaymentMockScenario }[] = [
  { label: "Direct capture", value: "direct_capture" },
  { label: "PIN to OTP", value: "pin_to_otp" },
  { label: "Additional fields", value: "additional_fields" },
  { label: "3DS return", value: "three_ds_return" },
  { label: "Pending", value: "pending" },
  { label: "Decline", value: "decline" },
  { label: "Cancellation", value: "cancellation" },
  { label: "Server failure", value: "server_failure" },
];

const additionalFieldLabels: Record<PaymentAdditionalField, string> = {
  billingZip: "Billing postal code",
  billingCity: "Billing city",
  billingAddress: "Billing address",
  billingState: "Billing state / region",
  billingCountry: "Billing country",
};

const statusPresentation = (status: PaymentStatus, isMock: boolean) => {
  switch (status) {
    case "CAPTURED":
      return {
        icon: "checkmark-circle" as const,
        title: "Payment captured",
        copy: isMock
          ? "The development scenario reports a captured result. No real charge was made."
          : "The backend-confirmed payment is complete.",
        color: Theme.colors.success,
      };
    case "FAILED":
      return {
        icon: "close-circle" as const,
        title: "Payment declined",
        copy: isMock
          ? "The development scenario declined the payment. You can run the simulated retry."
          : "The payment was not captured. No real retry is offered without confirmed retry rules.",
        color: Theme.colors.error,
      };
    case "CANCELLED":
      return {
        icon: "remove-circle" as const,
        title: "Payment cancelled",
        copy: isMock
          ? "The development scenario was cancelled and no success state was recorded."
          : "The payment was cancelled and no success state was recorded.",
        color: Theme.colors.text.gray,
      };
    case "REFUNDED":
      return {
        icon: "return-down-back" as const,
        title: "Payment refunded",
        copy: isMock
          ? "The development fixture is marked as refunded."
          : "The captured amount has been marked as refunded by the backend.",
        color: Theme.colors.orange,
      };
    case "PENDING":
      return {
        icon: "time" as const,
        title: "Payment pending",
        copy: isMock
          ? "The simulated confirmation is pending. The safe reference can be resumed later."
          : "Confirmation is still in progress. You can leave safely and resume later.",
        color: Theme.colors.orange,
      };
  }
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

const PaymentCheckoutForm = (props: PaymentCheckoutFormProps) => {
  const {
    mode,
    shipment,
    cards,
    selectedCardId,
    setSelectedCardId,
    scenario,
    setScenario,
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
    mockKycVerified,
    setMockKycVerified,
    mockAccepted,
    setMockAccepted,
    pay,
    submitChallenge,
    openRedirect,
    simulateReturn,
    retryMock,
    reload,
    openVerification,
    back,
  } = props;

  const busy = uiPhase === "submitting" || uiPhase === "recovering";
  const formattedAmount = useMemo(() => {
    if (!shipment) return "USD --";
    if (mode !== "mock") return "USD amount pending contract";
    return `USD ${(shipment.priceMinor / 100).toFixed(2)}`;
  }, [mode, shipment]);
  const result = status && !nextAction ? statusPresentation(status, mode === "mock") : null;

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
        <View style={[styles.modeBadge, mode === "mock" && styles.mockBadge]}>
          <Ionicons
            name={mode === "mock" ? "flask-outline" : "shield-checkmark-outline"}
            size={15}
            color={Theme.colors.primary}
          />
          <Text style={styles.modeBadgeText}>
            {mode === "mock"
              ? "Development mock - no real charge"
              : mode === "api"
                ? "API mode - charge execution gated"
                : "Payment execution blocked"}
          </Text>
        </View>

        {mode === "mock" ? (
          <View style={styles.devPanel}>
            <Text style={styles.devTitle}>Development scenarios</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.scenarioRow}>
                {scenarioOptions.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.scenarioPill,
                      scenario === item.value && styles.scenarioPillActive,
                    ]}
                    onPress={() => void setScenario(item.value)}
                  >
                    <Text
                      style={[
                        styles.scenarioText,
                        scenario === item.value && styles.scenarioTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>KYC verified</Text>
              <Switch
                value={mockKycVerified}
                onValueChange={setMockKycVerified}
                trackColor={{ true: Theme.colors.yellow, false: Theme.colors.text.border }}
                thumbColor={Theme.colors.primary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Traveller accepted</Text>
              <Switch
                value={mockAccepted}
                onValueChange={setMockAccepted}
                trackColor={{ true: Theme.colors.yellow, false: Theme.colors.text.border }}
                thumbColor={Theme.colors.primary}
              />
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.stateText}>Checking shipment and eligibility...</Text>
          </View>
        ) : null}

        {!loading && loadError ? (
          <View style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={38} color={Theme.colors.error} />
            <Text style={styles.stateTitle}>Checkout unavailable</Text>
            <Text style={styles.stateText}>{loadError}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => void reload()}>
              <Text style={styles.secondaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && shipment ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment eligibility</Text>
              <View style={styles.eligibilityRow}>
                <Ionicons
                  name={isKycVerified ? "checkmark-circle" : "close-circle"}
                  size={21}
                  color={isKycVerified ? Theme.colors.success : Theme.colors.error}
                />
                <Text style={styles.eligibilityText}>Identity verification</Text>
                <Text style={styles.eligibilityMeta}>
                  {isKycVerified ? "Verified" : "Required"}
                </Text>
              </View>
              <View style={styles.eligibilityRow}>
                <Ionicons
                  name={isAccepted ? "checkmark-circle" : "time"}
                  size={21}
                  color={isAccepted ? Theme.colors.success : Theme.colors.orange}
                />
                <Text style={styles.eligibilityText}>Traveller acceptance</Text>
                <Text style={styles.eligibilityMeta}>
                  {isAccepted ? "Accepted" : "Waiting"}
                </Text>
              </View>
              {!isKycVerified && mode !== "mock" ? (
                <TouchableOpacity style={styles.inlineButton} onPress={openVerification}>
                  <Text style={styles.inlineButtonText}>Open verification</Text>
                </TouchableOpacity>
              ) : null}
            </View>

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
                <Text style={styles.supportingText}>
                  Saved-card listing is disabled until the backend contract is supplied.
                </Text>
              ) : null}
              <View style={styles.disabledSetup}>
                <Ionicons name="lock-closed-outline" size={18} color={Theme.colors.text.gray} />
                <View style={styles.cardText}>
                  <Text style={styles.disabledSetupTitle}>Add card unavailable</Text>
                  <Text style={styles.supportingText}>
                    Secure card setup will open after a PCI-approved Flutterwave v4 collection method is confirmed.
                  </Text>
                </View>
              </View>
            </View>

            {nextAction && nextAction.mode !== "REDIRECT_URL" ? (
              <ChallengeForm nextAction={nextAction} busy={busy} onSubmit={submitChallenge} />
            ) : null}

            {nextAction?.mode === "REDIRECT_URL" ? (
              <View style={styles.card} accessibilityLiveRegion="polite">
                <Text style={styles.sectionTitle}>3DS verification required</Text>
                <Text style={styles.supportingText}>
                  The payment reference has been saved. Returning to the app triggers backend reconciliation; redirect parameters never establish success.
                </Text>
                <Text style={styles.returnUri} numberOfLines={2}>{returnUri}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => void openRedirect()}>
                  <Text style={styles.primaryButtonText}>Open secure 3DS</Text>
                </TouchableOpacity>
                {mode === "mock" ? (
                  <TouchableOpacity style={styles.secondaryButton} onPress={simulateReturn}>
                    <Text style={styles.secondaryButtonText}>Simulate app return</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {result ? (
              <View style={styles.stateCard} accessibilityLiveRegion="polite">
                <Ionicons name={result.icon} size={44} color={result.color} />
                <Text style={styles.stateTitle}>{result.title}</Text>
                <Text style={styles.stateText}>{result.copy}</Text>
                {reference ? <Text style={styles.reference}>Reference: {reference}</Text> : null}
                {mode === "mock" && status === "FAILED" ? (
                  <TouchableOpacity style={styles.secondaryButton} onPress={retryMock}>
                    <Text style={styles.secondaryButtonText}>Simulate retry</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {actionError ? (
              <View style={styles.errorBanner} accessibilityLiveRegion="assertive">
                <Ionicons name="alert-circle-outline" size={20} color={Theme.colors.error} />
                <Text style={styles.errorText}>{actionError}</Text>
              </View>
            ) : null}

            {!nextAction && !result ? (
              <>
                {blockedReason ? <Text style={styles.blockedCopy}>{blockedReason}</Text> : null}
                <TouchableOpacity
                  style={[styles.primaryButton, (Boolean(blockedReason) || busy) && styles.disabledButton]}
                  disabled={Boolean(blockedReason) || busy}
                  onPress={() => void pay()}
                >
                  {busy ? (
                    <ActivityIndicator color={Theme.colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Pay {formattedAmount}</Text>
                  )}
                </TouchableOpacity>
              </>
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
  modeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.background.border,
  },
  mockBadge: { backgroundColor: Theme.colors.yellow },
  modeBadgeText: { fontSize: 12, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  devPanel: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md },
  devTitle: { fontSize: 14, fontFamily: "Inter-Bold", color: Theme.colors.primary, marginBottom: Theme.spacing.sm },
  scenarioRow: { flexDirection: "row", gap: Theme.spacing.sm, paddingBottom: Theme.spacing.sm },
  scenarioPill: { paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.xl, backgroundColor: Theme.colors.background.border },
  scenarioPillActive: { backgroundColor: Theme.colors.yellow },
  scenarioText: { fontSize: 12, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  scenarioTextActive: { fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 42 },
  switchLabel: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.dark },
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
  disabledSetup: { flexDirection: "row", alignItems: "flex-start", gap: Theme.spacing.sm, marginTop: Theme.spacing.md, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.sm, backgroundColor: Theme.colors.background.secondary },
  disabledSetupTitle: { fontSize: 13, fontFamily: "Inter-SemiBold", color: Theme.colors.text.gray, marginBottom: 2 },
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
