import { Theme } from "@/constants/Theme";
import { SupportedBank } from "@/services/bankService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SupportedBankPickerProps {
  value: string;
  selectedBankName: string;
  banks: SupportedBank[];
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  onRetry: () => void;
  onSelect: (bank: SupportedBank) => void;
}

const SupportedBankPicker = ({
  value,
  selectedBankName,
  banks,
  loading,
  error,
  disabled = false,
  onRetry,
  onSelect,
}: SupportedBankPickerProps) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible]);

  const filteredBanks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return banks;
    }

    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(normalizedQuery) ||
        bank.code.toLowerCase().includes(normalizedQuery),
    );
  }, [banks, query]);

  const handleSelect = (bank: SupportedBank) => {
    onSelect(bank);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bank</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={selectedBankName ? `Selected bank: ${selectedBankName}` : "Select bank"}
        accessibilityState={{ disabled, expanded: visible }}
        disabled={disabled}
        activeOpacity={0.75}
        onPress={() => setVisible(true)}
        style={[styles.field, disabled && styles.disabledField]}
      >
        <Text
          style={[styles.fieldText, !selectedBankName && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedBankName || "Select a supported bank"}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        ) : (
          <Ionicons name="chevron-down" size={18} color={Theme.colors.text.gray} />
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.fieldError}>Unable to load banks. Tap the field to retry.</Text> : null}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close bank picker"
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />
          <SafeAreaView edges={["bottom"]} style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Select your bank</Text>
                <Text style={styles.subtitle}>Search by bank name or code</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close bank picker"
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color={Theme.colors.text.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchField}>
              <Ionicons name="search-outline" size={19} color={Theme.colors.text.gray} />
              <TextInput
                accessibilityLabel="Search supported banks"
                value={query}
                onChangeText={setQuery}
                placeholder="Search banks"
                placeholderTextColor={Theme.colors.text.lightGray}
                autoCorrect={false}
                style={styles.searchInput}
              />
              {query ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Clear bank search"
                  onPress={() => setQuery("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color={Theme.colors.text.lightGray} />
                </TouchableOpacity>
              ) : null}
            </View>

            {loading ? (
              <View style={styles.stateContent} accessibilityLiveRegion="polite">
                <ActivityIndicator color={Theme.colors.primary} />
                <Text style={styles.stateText}>Loading supported banks...</Text>
              </View>
            ) : error ? (
              <View style={styles.stateContent} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle-outline" size={34} color={Theme.colors.primary} />
                <Text style={styles.stateTitle}>Could not load banks</Text>
                <Text style={styles.stateText}>{error}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onRetry}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredBanks}
                keyExtractor={(bank) => bank.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                  filteredBanks.length === 0 ? styles.emptyList : styles.listContent
                }
                ListEmptyComponent={
                  <View style={styles.stateContent} accessibilityLiveRegion="polite">
                    <Ionicons name="business-outline" size={34} color={Theme.colors.primary} />
                    <Text style={styles.stateTitle}>
                      {query ? "No matching banks" : "No supported banks"}
                    </Text>
                    <Text style={styles.stateText}>
                      {query
                        ? `No bank matches "${query.trim()}".`
                        : "No supported banks were returned for this country."}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const selected = value === item.id;
                  return (
                    <TouchableOpacity
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${item.name}, bank code ${item.code}`}
                      activeOpacity={0.75}
                      onPress={() => handleSelect(item)}
                      style={[styles.bankRow, selected && styles.selectedBankRow]}
                    >
                      <View style={styles.bankIcon}>
                        <Ionicons name="business-outline" size={20} color={Theme.colors.primary} />
                      </View>
                      <View style={styles.bankText}>
                        <Text style={styles.bankName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.bankCode}>{item.code}</Text>
                      </View>
                      {selected ? (
                        <View style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={15} color={Theme.colors.primary} />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  field: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
  },
  disabledField: {
    opacity: 0.55,
    backgroundColor: Theme.colors.background.secondary,
  },
  fieldText: {
    flex: 1,
    marginRight: Theme.spacing.sm,
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  placeholderText: {
    color: Theme.colors.text.lightGray,
  },
  fieldError: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.error,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    height: "76%",
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.text.border,
    marginTop: Theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  subtitle: {
    marginTop: Theme.spacing.xs,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchField: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: Theme.spacing.sm,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  clearButton: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stateContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },
  stateTitle: {
    marginTop: Theme.spacing.sm,
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
  },
  stateText: {
    marginTop: Theme.spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
  listContent: {
    paddingBottom: Theme.spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  bankRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.border,
    paddingVertical: Theme.spacing.sm,
  },
  selectedBankRow: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.background.border,
  },
  bankText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  bankName: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  bankCode: {
    marginTop: Theme.spacing.xs,
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.yellow,
    marginLeft: Theme.spacing.sm,
  },
});

export default SupportedBankPicker;
