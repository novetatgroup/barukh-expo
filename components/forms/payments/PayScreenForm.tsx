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

type PayScreenFormProps = {
  shipmentCost: string;
  insurance: string;
  total: string;
  payAmount: string;
  onBack: () => void;
  onPay: () => void;
};

const PayScreenForm: React.FC<PayScreenFormProps> = ({
  shipmentCost,
  insurance,
  total,
  payAmount,
  onBack,
  onPay,
}) => {
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
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Shipment Cost</Text>
            <Text style={styles.paymentValue}>{shipmentCost}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Insurance</Text>
            <Text style={styles.paymentValue}>{insurance}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{total}</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.noticeCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information" size={15} color={Theme.colors.green} />
          </View>
          <Text style={styles.noticeText}>
            Your money is held securely until item/ride is complete.
          </Text>
          <Ionicons name="chevron-forward" size={22} color={Theme.colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.payButton}
          onPress={onPay}
        >
          <Text style={styles.payButtonText}>Pay {payAmount}</Text>
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
    paddingBottom: Theme.spacing.xxl,
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
  },
  paymentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.lg,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#53607A",
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#53607A",
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: "#53607A",
  },
  totalValue: {
    fontSize: 15,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  noticeCard: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Theme.colors.green,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.lg,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    lineHeight: 17,
  },
  payButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Theme.spacing.lg,
  },
  payButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default PayScreenForm;
