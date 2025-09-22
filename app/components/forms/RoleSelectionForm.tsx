import Theme from "@/app/constants/Theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RoleSelectionFormProps {
  onRoleSelect: (role: "TRAVELLER" | "SENDER") => void;
}

const RoleSelectionForm: React.FC<RoleSelectionFormProps> = ({ onRoleSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.subText}>How would you like to use Barukh?</Text>
      
      <View style={styles.optionsContainer}>
       
        <TouchableOpacity
          style={[styles.optionCard, styles.sendOption]}
          onPress={() => onRoleSelect("SENDER")}
        >
          <View style={styles.iconContainer}>
            <Image 
                    source={require('../../../assets/images/package.png')} 
                    style={styles.logo} 
                  />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.sendOptionTitle}>Barukh Send</Text>
            <Text style={styles.sendOptionSubtitle}>Package Received by Traveller</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.optionCard, styles.goOption]}
          onPress={() => onRoleSelect("TRAVELLER")}
        >
          <View style={styles.iconContainer}>
            <Image 
                    source={require('../../../assets/images/people-upload.png')} 
                    style={styles.logo} 
                  />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.goOptionTitle}>Barukh Go</Text>
            <Text style={styles.goOptionSubtitle}>Transport items or people on your trip</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
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
  sendOption: {
    backgroundColor: Theme.colors.primary,
  },
  goOption: {
    backgroundColor: Theme.colors.white,
  },
  iconContainer: {
    marginRight: Theme.spacing.md,
  },
  icon: {
    width: Theme.spacing.xxxl,
    height: Theme.spacing.xxxl,
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
    color: Theme.colors.text.light,
    marginBottom: Theme.spacing.xs,
  },
  sendOptionTitle:{
    ...Theme.typography.h2,
    fontWeight: "600",
    color: Theme.colors.yellow,
    marginBottom: Theme.spacing.xs,
  },
  goOptionTitle:{
    ...Theme.typography.h2,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  optionSubtitle: {
    ...Theme.typography.caption,
    color: "rgba(255, 255, 255, 0.8)",
  },
  sendOptionSubtitle:{
     ...Theme.typography.caption,
     color: Theme.colors.white,
  },
  goOptionSubtitle:{
    ...Theme.typography.caption,
    color: Theme.colors.text.gray,
  },
  arrow: {
    fontSize: 24,
    color:Theme.colors.yellow,
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