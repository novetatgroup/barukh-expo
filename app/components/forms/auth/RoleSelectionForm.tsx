import Theme from "@/app/constants/Theme";
import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RoleSelectionFormProps {
  onRoleSelect: (role: "TRAVELLER" | "SENDER") => void;
}

const RoleSelectionForm: React.FC<RoleSelectionFormProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<"TRAVELLER" | "SENDER" | null>(null);

  const handleRoleSelect = (role: "TRAVELLER" | "SENDER") => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.subText}>How would you like to use Barukh?</Text>
      
      <View style={styles.optionsContainer}>
       
        <TouchableOpacity
          style={[
            styles.optionCard, 
            selectedRole === "SENDER" ? styles.selectedOption : styles.option
          ]}
          onPress={() => handleRoleSelect("SENDER")}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="cube" 
              size={25} 
              color={selectedRole === "SENDER" ? Theme.colors.white : Theme.colors.primary}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              selectedRole === "SENDER" && styles.selectedText
            ]}>
              Barukh Send
            </Text>
            <Text style={[
              styles.optionSubtitle,
              selectedRole === "SENDER" && styles.selectedSubtitle
            ]}>
              Package Received by Traveller
            </Text>
          </View>
          <Text style={[
            styles.arrow,
            selectedRole === "SENDER" && styles.selectedText
          ]}>
            ›
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.optionCard, 
            selectedRole === "TRAVELLER" ? styles.selectedOption : styles.option
          ]}
          onPress={() => handleRoleSelect("TRAVELLER")}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="people" 
              size={25} 
              color={selectedRole === "TRAVELLER" ? Theme.colors.white : Theme.colors.primary}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              selectedRole === "TRAVELLER" && styles.selectedText
            ]}>
              Barukh Go
            </Text>
            <Text style={[
              styles.optionSubtitle,
              selectedRole === "TRAVELLER" && styles.selectedSubtitle
            ]}>
              Transport items or people on your trip
            </Text>
          </View>
          <Text style={[
            styles.arrow,
            selectedRole === "TRAVELLER" && styles.selectedText
          ]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        *You can switch roles at any time in the profile settings
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.xxxxxxxl + Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  welcomeText: {
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
    marginBottom: Theme.spacing.xxxl,
  },
  optionsContainer: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxxxxl,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    height: Theme.components.button.height + Theme.spacing.lg,
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
    backgroundColor: Theme.colors.primary,
  },
  iconContainer: {
    marginRight: Theme.spacing.md,
  },
  icon: {
    width: Theme.spacing.xxl,
    height: Theme.spacing.xxl,
    borderRadius: Theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 45,
    height: 45,
  },
  sendIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  goIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  iconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Theme.typography.h2,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  optionSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.text.gray,
  },
  selectedText: {
    color: Theme.colors.white,
  },
  selectedSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  arrow: {
    fontSize: 24,
    color: Theme.colors.primary,
    fontWeight: "300",
  },
  footerText: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginTop: "auto",
  },
});

export default RoleSelectionForm;