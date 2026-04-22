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

type DetailIcon = keyof typeof Ionicons.glyphMap;

type DetailRow = {
  label: string;
  value: string;
};

type CategoryDetailsFormProps = {
  headerTitle: string;
  title: string;
  subtitle: string;
  status: string;
  icon: DetailIcon;
  iconBackground?: string;
  rows: DetailRow[];
  onBack: () => void;
};

const CategoryDetailsForm: React.FC<CategoryDetailsFormProps> = ({
  headerTitle,
  title,
  subtitle,
  status,
  icon,
  iconBackground = Theme.colors.yellow,
  rows,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Theme.colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
              <Ionicons name={icon} size={26} color={Theme.colors.primary} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.grid}>
            {rows.map((row) => (
              <View key={row.label} style={styles.detailCell}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
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
    paddingTop: 56,
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
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 18,
    padding: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  heroText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.yellow,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginVertical: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Theme.spacing.lg,
  },
  detailCell: {
    width: "50%",
    paddingRight: Theme.spacing.md,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
});

export default CategoryDetailsForm;
