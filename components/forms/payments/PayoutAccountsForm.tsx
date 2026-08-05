import CustomDropdown from "@/components/ui/Dropdown";
import SupportedBankPicker from "@/components/forms/payments/SupportedBankPicker";
import { PAYOUT_COUNTRIES } from "@/constants/payout";
import { Theme } from "@/constants/Theme";
import { usePayoutAccounts } from "@/hooks/usePayoutAccounts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = ReturnType<typeof usePayoutAccounts>;
type Tab = "accounts" | "payouts";

const PayoutAccountsForm = (props: Props) => {
  const [tab, setTab] = useState<Tab>("accounts");
  const {
    mode,
    accounts,
    payouts,
    loading,
    submitting,
    error,
    success,
    form,
    formVisible,
    editingId,
    currency,
    supportedBanks,
    banksLoading,
    banksError,
    updateField,
    updateCountry,
    selectBank,
    retrySupportedBanks,
    openCreate,
    openEdit,
    setDefault,
    deleteAccount,
    closeForm,
    submit,
    back,
  } = props;

  const confirmDelete = (accountId: string) => {
    Alert.alert(
      "Delete development account?",
      "This removes only the local masked fixture.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteAccount(accountId),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traveller payouts</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.tabs}>
        {(["accounts", "payouts"] as const).map((item) => (
          <TouchableOpacity key={item} style={[styles.tab, tab === item && styles.activeTab]} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>
              {item === "accounts" ? "Bank accounts" : "Payout status"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {mode === "mock" ? (
          <View style={styles.mockNotice}>
            <Ionicons name="flask-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.mockNoticeText}>
              Lists and edits are development fixtures. Creating a new account calls the real bank-account API and never falls back to mock success.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
        {success ? <Text style={styles.successBanner}>{success}</Text> : null}

        {tab === "accounts" ? (
          <>
            {!formVisible ? (
              <TouchableOpacity style={styles.primaryButton} onPress={openCreate}>
                <Ionicons name="add" size={20} color={Theme.colors.white} />
                <Text style={styles.primaryButtonText}>Add payout account</Text>
              </TouchableOpacity>
            ) : null}

            {formVisible ? (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.sectionTitle}>{editingId ? "Edit development account" : "Create payout account"}</Text>
                  <TouchableOpacity onPress={closeForm} accessibilityLabel="Close payout form">
                    <Ionicons name="close" size={22} color={Theme.colors.text.gray} />
                  </TouchableOpacity>
                </View>
                <CustomDropdown
                  label="Country"
                  value={form.country}
                  options={PAYOUT_COUNTRIES.map((item) => item.country)}
                  onSelect={(value) => updateCountry(value as typeof form.country)}
                />
                <Text style={styles.label}>Currency</Text>
                <View style={styles.readOnlyField}><Text style={styles.readOnlyText}>{currency}</Text></View>
                <SupportedBankPicker
                  value={form.bankId}
                  selectedBankName={form.bankName}
                  banks={supportedBanks}
                  loading={banksLoading}
                  error={banksError}
                  disabled={submitting}
                  onRetry={() => void retrySupportedBanks()}
                  onSelect={selectBank}
                />
                <Text style={styles.label}>Account holder name</Text>
                <TextInput style={styles.input} value={form.accountHolderName} onChangeText={(value) => updateField("accountHolderName", value)} placeholder="Name on the bank account" placeholderTextColor={Theme.colors.text.lightGray} />
                <Text style={styles.label}>Account number</Text>
                <TextInput style={styles.input} value={form.accountNumber} onChangeText={(value) => updateField("accountNumber", value)} placeholder={editingId ? "Leave blank to keep masked account" : "Bank account number"} placeholderTextColor={Theme.colors.text.lightGray} keyboardType="number-pad" secureTextEntry />
                <View style={styles.switchRow}>
                  <View style={styles.switchText}>
                    <Text style={styles.label}>Make default</Text>
                    <Text style={styles.helpText}>Use this account for future payouts by default.</Text>
                  </View>
                  <Switch value={form.isDefault} onValueChange={(value) => updateField("isDefault", value)} trackColor={{ true: Theme.colors.yellow, false: Theme.colors.text.border }} thumbColor={Theme.colors.primary} />
                </View>
                <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} disabled={submitting} onPress={() => void submit()}>
                  {submitting ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.primaryButtonText}>{editingId ? "Save development changes" : "Create payout account"}</Text>}
                </TouchableOpacity>
              </View>
            ) : null}

            {loading ? <ActivityIndicator color={Theme.colors.primary} /> : accounts.map((account) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountIcon}><Ionicons name="business-outline" size={22} color={Theme.colors.primary} /></View>
                <View style={styles.accountText}>
                  <View style={styles.accountTitleRow}>
                    <Text style={styles.accountTitle} numberOfLines={1}>{account.bankName}</Text>
                    {account.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
                  </View>
                  <Text style={styles.accountMeta}>{account.accountHolderName}</Text>
                  <Text style={styles.accountMeta}>{account.maskedAccountNumber} - {account.currency}</Text>
                  {account.swiftCode ? <Text style={styles.accountMeta}>SWIFT {account.swiftCode}</Text> : null}
                </View>
                {mode === "mock" ? (
                  <View style={styles.accountActions}>
                    {!account.isDefault ? (
                      <TouchableOpacity onPress={() => void setDefault(account.id)} style={styles.actionIcon} accessibilityLabel="Make default account">
                        <Ionicons name="star-outline" size={18} color={Theme.colors.primary} />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => openEdit(account)} style={styles.actionIcon} accessibilityLabel="Edit account">
                      <Ionicons name="create-outline" size={19} color={Theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(account.id)} style={styles.actionIcon} accessibilityLabel="Delete account">
                      <Ionicons name="trash-outline" size={18} color={Theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}

            {mode !== "mock" ? <View style={styles.disabledNotice}><Text style={styles.helpText}>Bank listing, update, default switching, and deletion are disabled until backend contracts are supplied.</Text></View> : null}
          </>
        ) : (
          <>
            {payouts.map((payout) => (
              <View key={payout.shipmentId} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <Text style={styles.accountTitle}>{payout.shipmentId}</Text>
                  <Text style={[styles.payoutStatus, payout.status === "REJECTED" && styles.rejectedStatus]}>{payout.status}</Text>
                </View>
                {"updatedAt" in payout ? <Text style={styles.accountMeta}>Updated {new Date(payout.updatedAt).toLocaleString()}</Text> : null}
                {payout.status === "PAID" ? <Text style={styles.helpText}>Paid to {payout.maskedAccount}</Text> : null}
                {payout.status === "PENDING" || payout.status === "PROCESSING" ? <Text style={styles.helpText}>Processing time varies by bank and country.</Text> : null}
                {payout.status === "REJECTED" ? <View style={styles.rejectedGuide}><Text style={styles.helpText}>{payout.guidance}</Text><Text style={styles.noRetry}>No payout retry is available in the app.</Text></View> : null}
              </View>
            ))}
            {payouts.length === 0 ? <View style={styles.disabledNotice}><Text style={styles.helpText}>Payout status is disabled until the backend status contract is supplied.</Text></View> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.secondary },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Theme.spacing.xxxxxl, paddingHorizontal: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.md },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  tabs: { flexDirection: "row", gap: Theme.spacing.sm, paddingHorizontal: Theme.screenPadding.horizontal },
  tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: Theme.borderRadius.xl, backgroundColor: Theme.colors.background.border },
  activeTab: { backgroundColor: Theme.colors.yellow },
  tabText: { fontSize: 13, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  activeTabText: { fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  content: { padding: Theme.screenPadding.horizontal, paddingBottom: Theme.spacing.xxxxxl, gap: Theme.spacing.md },
  mockNotice: { flexDirection: "row", alignItems: "flex-start", gap: Theme.spacing.sm, backgroundColor: Theme.colors.yellow, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md },
  mockNoticeText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.primary },
  primaryButton: { minHeight: 52, flexDirection: "row", gap: Theme.spacing.sm, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.xl, paddingHorizontal: Theme.spacing.md },
  primaryButtonText: { fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.white, textAlign: "center" },
  disabled: { opacity: 0.5 },
  formCard: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Theme.spacing.sm },
  sectionTitle: { fontSize: 16, fontFamily: "Inter-Bold", color: Theme.colors.text.dark },
  label: { fontSize: 13, fontFamily: "Inter-SemiBold", color: Theme.colors.text.gray, marginTop: Theme.spacing.sm, marginBottom: Theme.spacing.xs },
  input: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.text.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 15, fontFamily: "Inter-Regular", color: Theme.colors.text.dark, marginBottom: Theme.spacing.sm },
  readOnlyField: { minHeight: 50, justifyContent: "center", borderRadius: Theme.borderRadius.sm, backgroundColor: Theme.colors.background.secondary, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.sm },
  readOnlyText: { fontSize: 15, fontFamily: "Inter-SemiBold", color: Theme.colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", marginBottom: Theme.spacing.md },
  switchText: { flex: 1 },
  helpText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  accountCard: { minHeight: 96, flexDirection: "row", alignItems: "center", backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md },
  accountIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background.border, marginRight: Theme.spacing.sm },
  accountText: { flex: 1 },
  accountTitleRow: { flexDirection: "row", alignItems: "center", gap: Theme.spacing.sm },
  accountTitle: { flex: 1, fontSize: 14, fontFamily: "Inter-SemiBold", color: Theme.colors.text.dark },
  accountMeta: { fontSize: 11, lineHeight: 17, fontFamily: "Inter-Regular", color: Theme.colors.text.gray },
  defaultBadge: { fontSize: 10, fontFamily: "Inter-SemiBold", color: Theme.colors.primary, backgroundColor: Theme.colors.yellow, borderRadius: Theme.borderRadius.xl, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs },
  accountActions: { flexDirection: "row", alignItems: "center" },
  actionIcon: { width: 34, height: 38, alignItems: "center", justifyContent: "center" },
  errorBanner: { fontSize: 13, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.error, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.error, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md },
  successBanner: { fontSize: 13, lineHeight: 18, fontFamily: "Inter-Regular", color: Theme.colors.primary, backgroundColor: Theme.colors.lightGreen, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md },
  disabledNotice: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md },
  payoutCard: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md },
  payoutHeader: { flexDirection: "row", alignItems: "center", marginBottom: Theme.spacing.sm },
  payoutStatus: { fontSize: 10, fontFamily: "Inter-Bold", color: Theme.colors.orange },
  rejectedStatus: { color: Theme.colors.error },
  rejectedGuide: { backgroundColor: Theme.colors.background.secondary, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  noRetry: { fontSize: 11, fontFamily: "Inter-SemiBold", color: Theme.colors.error, marginTop: Theme.spacing.xs },
});

export default PayoutAccountsForm;
