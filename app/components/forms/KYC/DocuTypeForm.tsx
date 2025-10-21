import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import KYCContext from "@/app/context/KYCContext";
import CustomDropdown from "../../ui/Dropdown";

const countries = [
  'KENYA',
  'UGANDA',
  'TANZANIA',
]

type DocumentTypeSelectionFormProps = {
  onDocumentTypeSelect: (
    id_type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE",
    country: string
  ) => void;
};

const DocumentTypeSelectionForm: React.FC<DocumentTypeSelectionFormProps> = ({ onDocumentTypeSelect }) => {
  const { country, id_type, updateIdInfo } = useContext(KYCContext);

  const handleDocumentTypeSelect = (selectedType: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE") => {
    if (!country) return;

    updateIdInfo(country, selectedType);
    onDocumentTypeSelect(selectedType, country);
  };

  const handleCountryChange = (selectedCountry: string) => {
    if (selectedCountry) {
      updateIdInfo(selectedCountry, id_type || "IDENTITY_CARD");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.verifyText}>Verify</Text>
        <Text style={styles.accountText}>Account</Text>
        <Text style={styles.subText}>Choose Your Document Type</Text>
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.sectionTitle}>Select Country of Issue</Text>
        <CustomDropdown
          value={country || ""}
          options={countries}
          placeholder="Select a country..."
          onSelect={(value) => handleCountryChange(value)}
        />
      </View>

      <View style={styles.documentSection}>
        <Text style={styles.sectionTitle}>Select Document Type</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.optionCard,
              styles.option,
              id_type === "PASSPORT" && styles.selectedOption,

            ]}
            onPress={() => handleDocumentTypeSelect("PASSPORT")}
            disabled={!country}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="document-text"
                size={25}
                color={Theme.colors.primary}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle]}>
                Passport
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.optionCard,
              styles.option,
              id_type === "DRIVING_LICENCE" && styles.selectedOption,
            ]}
            onPress={() => handleDocumentTypeSelect("DRIVING_LICENCE")}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="card"
                size={25}
                color={Theme.colors.primary}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle]}>
                Driving Licence
              </Text>
            </View>
            <Text style={[styles.arrow]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.optionCard,
              styles.option,
              id_type === "IDENTITY_CARD" && styles.selectedOption,
            ]}
            onPress={() => handleDocumentTypeSelect("IDENTITY_CARD")}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="id-card"
                size={25}
                color={Theme.colors.primary}
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle]}>
                National ID
              </Text>
            </View>
            <Text style={[styles.arrow]}>›</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.xxxl + Theme.spacing.sm,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  verifyText: {
    ...Theme.typography.h1,
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
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
    color: Theme.colors.primary,
  },
  countrySection: {
    marginBottom: Theme.spacing.xl,
  },
  documentSection: {
    flex: 1,
  },
  sectionTitle: {
    ...Theme.typography.body,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
    fontWeight: "600",
  },
  countryPickerContainer: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: Theme.colors.white,
  },
  dropdown: {
    height: 50,
    width: "100%",
    color: Theme.colors.primary,
  },
  optionsContainer: {
    gap: Theme.spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    minHeight: Theme.components.button.height + Theme.spacing.lg,
    shadowColor: Theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  option: {
    backgroundColor: Theme.colors.white,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  iconContainer: {
    marginRight: Theme.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Theme.typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 28,
    color: Theme.colors.black,
    fontWeight: "300",
  },
});

export default DocumentTypeSelectionForm;