import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";

interface UploadPackageFormProps {
  onBack: () => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onUpload: () => void;
  selectedImage: string | null;
}

const UploadPackageForm: React.FC<UploadPackageFormProps> = ({
  onBack,
  onPickImage,
  onTakePhoto,
  onUpload,
  selectedImage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Upload Package</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Uploading the received package helps us verify{"\n"}
          the item for both your and the traveler’s safety.
        </Text>

        <TouchableOpacity
          style={[
          styles.uploadArea, 
        ]} 
          onPress={onPickImage}
          activeOpacity={0.7}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={48} color="#CCCCCC" />
              <Text style={styles.uploadText}>Select file</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.cameraButton} onPress={onTakePhoto}>
          <Ionicons name="camera" size={20} color={Theme.colors.white} />
          <Text style={styles.cameraButtonText}>Open Camera & Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraButton, { marginTop: 20 }]}
          onPress={onUpload}
        >
          <Ionicons name="cloud-upload" size={20} color={Theme.colors.white} />
          <Text style={styles.cameraButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop:Theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.black,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  instructionText: {
    fontSize: 14,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
  },
  uploadArea: {
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
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: Theme.borderRadius.md,
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: Theme.spacing.sm,
  },
  orText: {
    fontSize: 14,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginVertical: Theme.spacing.md,
  },
  cameraButton: {
    flexDirection: "row",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
  },
  cameraButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UploadPackageForm;
