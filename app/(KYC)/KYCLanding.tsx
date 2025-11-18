import Theme from "@/app/constants/Theme";
import { router } from "expo-router";
import React from "react";
import { 
  StyleSheet, 
  Text, 
  View 
} from "react-native";
import CustomButton from "@/app/components/ui/CustomButton";

interface KYCVerificationScreenProps {
  onBeginKYC?: () => void;
}

const KYCVerificationScreen: React.FC<KYCVerificationScreenProps> = ({ onBeginKYC }) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.title}>
          Verify{"\n"}
          <Text style={styles.titleBold}>Account</Text>
        </Text>
        
        <Text style={styles.description}>
          For your security and updates, we'll need to verify your identity.
        </Text>

        <CustomButton
          title="Begin KYC"
          variant="primary"
          onPress={() => router.push("/(KYC)/verifyPhoneNoScreen")}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Theme.screenPadding.horizontal,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "400",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 48,
    textAlign: "center",
  },
  titleBold: {
    fontWeight: "700",
  },
  description: {
    ...Theme.typography.body,
    fontSize: 15,
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.xxxl,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
});

export default KYCVerificationScreen;