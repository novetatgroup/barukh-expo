import Theme from "@/app/constants/Theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DocumentTypeSelectionFormProps = {
  onDocumentTypeSelect: (document_type: "PASSPORT" | "ID" | "DRIVING LICENCE") => void;
}

const DocumentTypeSelectionForm: React.FC<DocumentTypeSelectionFormProps> = ({ onDocumentTypeSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.verifyText}>Verify</Text>
      <Text style={styles.accountText}>Account</Text>
      <Text style={styles.subText}>Choose Your Document Type</Text>
      
      <View style={styles.optionsContainer}>
       
        <TouchableOpacity
          style={[styles.optionCard, styles.option]}
          onPress={() => onDocumentTypeSelect("PASSPORT")}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="document-text" 
              size={30} 
              color={Theme.colors.white} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Passport</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.optionCard, styles.option]}
          onPress={() => onDocumentTypeSelect("DRIVING LICENCE")}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="card" 
              size={30} 
              color={Theme.colors.white} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Driving Licence</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      

      <TouchableOpacity
          style={[styles.optionCard, styles.option]}
          onPress={() => onDocumentTypeSelect("ID")}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="id-card" 
              size={30} 
              color={Theme.colors.white} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>National ID</Text>
            
          </View>
           <Text style={styles.arrow}>›</Text>
         
        </TouchableOpacity>
      </View>

      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.xxxxl + Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
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
    backgroundColor: Theme.colors.primary,
  },
  iconContainer: {
    marginRight: Theme.spacing.md,
  },
  icon: {
    width: Theme.spacing.xxl,
    height: Theme.spacing.xxxl,
    borderRadius: Theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
      width: 30,
      height: 30,
    },
  iconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Theme.typography.body,
    fontWeight: "600",
    color: Theme.colors.text.light,
    marginBottom: Theme.spacing.xs,
  },
  arrow: {
    fontSize: 28,
    color:Theme.colors.yellow,
    fontWeight: "300",
  },
});

export default DocumentTypeSelectionForm;