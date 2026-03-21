import Theme from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import KYCContext from "@/context/KYCContext";

type DocumentTypeSelectionFormProps = {
  onDocumentTypeSelect: (
    id_type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE",
  ) => void;
  isLoading?: boolean;
};

const DocumentTypeSelectionForm: React.FC<DocumentTypeSelectionFormProps> = ({ onDocumentTypeSelect, isLoading = false }) => {
  const { id_type, updateIdType } = useContext(KYCContext);

  const handleDocumentTypeSelect = (selectedType: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE") => {
    updateIdType(selectedType);
    onDocumentTypeSelect(selectedType);
  };

  const options: { type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE"; label: string }[] = [
    { type: "IDENTITY_CARD", label: "National ID" },
    { type: "DRIVING_LICENCE", label: "Driving License" },
    { type: "PASSPORT", label: "Passport" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.verifyText}>Verify</Text>
          <Text style={styles.accountText}>Account</Text>
          <Text style={styles.subText}>Choose Your Document Type</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map(({ type, label }) => {
            const selected = id_type === type;
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.85}
                style={[styles.optionCard, selected && styles.selectedCard]}
                onPress={() => handleDocumentTypeSelect(type)}
                disabled={isLoading}
              >
                <View style={[styles.iconCircle, selected && styles.selectedIconCircle]}>
                  <Ionicons
                    name="card"
                    size={20}
                    color={Theme.colors.yellow}
                  />
                </View>
                <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>
                  {label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={selected ? Theme.colors.yellow : Theme.colors.black}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f2",
    paddingHorizontal: Theme.screenPadding.horizontal,
    justifyContent: "center",
    paddingBottom: Theme.spacing.xxl,
  },
  content: {
    // natural block, centered by parent's justifyContent
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  verifyText: {
    ...Theme.typography.h1,
    fontSize: 32,
    fontWeight: "400",
    textAlign: "center",
    color: Theme.colors.primary,
  },
  accountText: {
    ...Theme.typography.h1,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
  },
  subText: {
    ...Theme.typography.body,
    textAlign: "center",
    color: Theme.colors.black,
  },
  optionsContainer: {
    gap: Theme.spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    minHeight: 66,
  },
  selectedCard: {
    backgroundColor: Theme.colors.primary,
    borderWidth: 0,
  },
  iconCircle: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  selectedIconCircle: {
    backgroundColor: Theme.colors.white,
  },
  optionLabel: {
    flex: 1,
    ...Theme.typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: Theme.colors.black,
  },
  selectedLabel: {
    color: Theme.colors.yellow,
    fontWeight: "600",
  },
});

export default DocumentTypeSelectionForm;
