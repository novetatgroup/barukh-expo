import { Role, ROLE_OPTIONS } from "@/app/constants/roles";
import Theme from "@/app/constants/Theme";
import React, { ComponentType } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";
import RoleOption from "../../RoleOption";

interface RoleSelectionFormProps {
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => void;
  isLoading?: boolean;
}

const RoleSelectionForm: React.FC<RoleSelectionFormProps> = ({
  selectedRole,
  onRoleSelect,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.subText}>How would you like to use Barukh?</Text>

        <View style={styles.optionsContainer}>
          {ROLE_OPTIONS.map((option) => (
            <RoleOption
              key={option.value}
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon as ComponentType<SvgProps>}
              value={option.value}
              selected={selectedRole === option.value}
              onPress={onRoleSelect}
              disabled={isLoading}
            />
          ))}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        )}
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
    backgroundColor: "#F4F1F2",
    paddingHorizontal: Theme.screenPadding.horizontal,
    justifyContent: "center",
    paddingBottom: Theme.spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Theme.spacing.xxxl,
  },
  welcomeText: {
    ...Theme.typography.h1,
    fontSize: 32,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
  },
  subText: {
    ...Theme.typography.body,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xxxl,
  },
  optionsContainer: {
    gap: Theme.spacing.md,
  },
  loadingContainer: {
    marginTop: Theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.primary,
    textAlign: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    position: "absolute",
    bottom: Theme.spacing.xxl,
    left: Theme.screenPadding.horizontal,
    right: Theme.screenPadding.horizontal,
  },
});

export default RoleSelectionForm;
