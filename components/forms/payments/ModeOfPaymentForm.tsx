import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentMode = "Mobile Money" | "Paypal" | "Apple Pay" | "Wallet Pay" | "Cash On Delivery";

type ModeOfPaymentFormProps = {
  selectedMode: PaymentMode;
  onBack: () => void;
  onSelectMode: (mode: PaymentMode) => void;
};

const ModeOfPaymentForm: React.FC<ModeOfPaymentFormProps> = ({
  selectedMode,
  onBack,
  onSelectMode,
}) => {
  const renderOption = (
    mode: PaymentMode,
    title: string,
    subtitle?: string,
    badge?: string
  ) => {
    const isSelected = selectedMode === mode;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.paymentOption, isSelected && styles.selectedOption]}
        onPress={() => onSelectMode(mode)}
      >
        <View style={[styles.optionIcon, mode === "Wallet Pay" && styles.walletIcon]}>
          {mode === "Wallet Pay" ? (
            <View style={styles.walletIconDot} />
          ) : null}
        </View>

        <View style={styles.optionText}>
          <View style={styles.optionTitleRow}>
            <Text style={styles.optionTitle}>{title}</Text>
            {badge ? (
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
        </View>

        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected ? <View style={styles.radioInner} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.methodCard}
          onPress={() => onSelectMode("Mobile Money")}
        >
          <View style={styles.methodIcon}>
            <Ionicons name="business-outline" size={21} color={Theme.colors.green} />
          </View>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>Mobile Money</Text>
            <Text style={styles.methodSubtitle}>Use your local Mobile Money Payment</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Theme.colors.black} />
        </TouchableOpacity>

        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="card-outline" size={22} color={Theme.colors.green} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.methodTitle}>Add your debit card</Text>
              <Text style={styles.methodSubtitle}>
                You can use debit card for continue your payment.
              </Text>
            </View>
            <Ionicons name="chevron-up" size={20} color={Theme.colors.black} />
          </View>

          <Text style={styles.chooseText}>Choose your favourite payment:</Text>

          {renderOption("Paypal", "Paypal", "Takes minutes for completed")}
          {renderOption("Apple Pay", "Apple Pay")}
          {renderOption("Wallet Pay", "Wallet Pay", "Cashback 10% new user", "10% OFF")}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.methodCard}
          onPress={() => onSelectMode("Cash On Delivery")}
        >
          <View style={styles.methodIcon}>
            <Ionicons name="cash-outline" size={23} color={Theme.colors.green} />
          </View>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>Cash On Delivery</Text>
            <Text style={styles.methodSubtitle}>Option for Local Packages</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 88,
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
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  methodCard: {
    minHeight: 74,
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    paddingHorizontal: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    width: 30,
    alignItems: "center",
    marginRight: Theme.spacing.sm,
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: 3,
  },
  methodSubtitle: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#4D5873",
    lineHeight: 18,
  },
  cardSection: {
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    padding: Theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    paddingRight: Theme.spacing.sm,
  },
  chooseText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#53607A",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  paymentOption: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  selectedOption: {
    borderColor: Theme.colors.green,
  },
  optionIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    marginRight: Theme.spacing.md,
  },
  walletIcon: {
    borderColor: "#1F2937",
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
  },
  walletIconDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Theme.colors.white,
  },
  optionText: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  optionSubtitle: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: "#53607A",
    marginTop: 3,
  },
  offerBadge: {
    backgroundColor: "#D9F3D6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  offerBadgeText: {
    fontSize: 9,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Theme.spacing.sm,
  },
  radioOuterSelected: {
    borderColor: Theme.colors.green,
    borderWidth: 5,
  },
  radioInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.white,
  },
});

export default ModeOfPaymentForm;
