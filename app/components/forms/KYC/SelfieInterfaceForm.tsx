import React from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";
import KYCContext from "@/app/context/KYCContext";
import CustomButton from "../../ui/CustomButton";

type SelfieCaptureFormProps = {
  isLoading: boolean;
  onTakePhoto: () => void;
  onSubmit: () => void;
}

const SelfieCaptureForm: React.FC<SelfieCaptureFormProps> = ({
  isLoading,
  onTakePhoto,
  onSubmit,
}) => {

  const { selfieImage } = React.useContext(KYCContext);

  const renderSelfieSection = (
    imageUri: string | null,
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}></Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.imageContainer, 
          imageUri && styles.imageContainerFilled
        ]} 
        onPress={onTakePhoto}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.capturedImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.placeholderContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={Theme.colors.blue} />
            ) : (
              <>
                <Ionicons name="camera" size={48} color={Theme.colors.text.gray} />
                <Text style={styles.placeholderText}>Tap to take selfie</Text>
                <Text style={styles.placeholderSubtext}>
                  Make sure your face is clearly visible
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.verifyText}>Verify</Text>
        <Text style={styles.identityText}>Identity</Text>
        <Text style={styles.subText}>Take a selfie to verify your identity</Text>
      </View>

      <View style={styles.content}>
        {renderSelfieSection(selfieImage)}
    
      </View>

      <View>
        <CustomButton 
            title="Submit Selfie" 
            variant="primary" 
            style={styles.submitButton} 
            onPress={onSubmit}
            disabled={isLoading}
          />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  verifyText: {
    ...Theme.typography.h1,
    fontWeight: "500",
    textAlign: "center",
    color: Theme.colors.primary,   
  },
  identityText: {
    ...Theme.typography.h1,
    fontWeight: "700",
    textAlign: "center",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
  },
  subText: {
    ...Theme.typography.body,
    textAlign: "center",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },

  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
    marginTop: Theme.spacing.lg + Theme.spacing.xs,
    backgroundColor: Theme.colors.background.primary,
    borderBottomColor: Theme.colors.background.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.screenPadding.horizontal,
  },

  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.dark,
    marginLeft: Theme.spacing.sm,
  },

    submitButton: {
      marginBottom: Theme.spacing.xxxxxxl,
      height: Theme.components.button.height,
      margin: Theme.spacing.xl,
    },

  imageContainer: {
    width: "100%",
    height: 280, 
    borderWidth: 3,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
    borderStyle: "dashed",
    position: "relative",
  },
  imageContainerFilled: {
    borderColor: Theme.colors.success,
    borderStyle: "solid",
    backgroundColor: Theme.colors.background.primary,
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    borderRadius: Theme.borderRadius.md - 2,
  },

  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.sm + Theme.spacing.xs,
  },
  placeholderSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.text.lightGray,
    marginTop: Theme.spacing.xs,
    textAlign: "center",
  },
});

export default SelfieCaptureForm;
