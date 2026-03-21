import Theme from "@/constants/Theme";
import KYCContext from "@/context/KYCContext";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import React, { useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FRAME_WIDTH = 300;
const FRAME_HEIGHT = 190;
const SELFIE_SIZE = 300;

type CapturedImage = { image_type_id: number; image: string };

type KYCCameraFlowProps = {
  onComplete: (images: CapturedImage[]) => void;
  onImageCaptured?: (image: CapturedImage) => void;
  onClose: () => void;
  isSubmitting?: boolean;
};

type StepConfig = {
  stepNumber: number;
  facing: "back" | "front";
  image_type_id: number;
  showOval: boolean;
  getInstruction: (docLabel: string) => React.ReactNode;
  reviewQuestion: string;
};

const STEPS: StepConfig[] = [
  {
    stepNumber: 1,
    facing: "back",
    image_type_id: 3,
    showOval: false,
    getInstruction: (docLabel) => (
      <Text style={styles.instructionText}>
        Front side of your {docLabel}{"\n"}within the frame
      </Text>
    ),
    reviewQuestion: "Is the document within the frame and\nthe text is readable?",
  },
  {
    stepNumber: 2,
    facing: "back",
    image_type_id: 7,
    showOval: false,
    getInstruction: (docLabel) => (
      <Text style={styles.instructionText}>
        <Text style={styles.instructionBold}>Back side</Text>
        {" of your "}{docLabel}{"\n"}within the frame
      </Text>
    ),
    reviewQuestion: "Is the document within the frame and\nthe text is readable?",
  },
  {
    stepNumber: 3,
    facing: "front",
    image_type_id: 2,
    showOval: true,
    getInstruction: () => (
      <Text style={styles.instructionText}>
        <Text style={styles.instructionBold}>Your face</Text>
        {" within the frame"}
      </Text>
    ),
    reviewQuestion: "Is your face within the frame and your\nfacial features distinguishable?",
  },
];

const DOC_LABELS: Record<string, string> = {
  PASSPORT: "passport",
  IDENTITY_CARD: "national ID",
  DRIVING_LICENCE: "driver's licence",
};

const KYCCameraFlow: React.FC<KYCCameraFlowProps> = ({ onComplete, onImageCaptured, onClose, isSubmitting = false }) => {
  const { id_type, addImage } = useContext(KYCContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [stepIndex, setStepIndex] = useState(0);
  const [reviewUri, setReviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const capturedRef = useRef<CapturedImage[]>([]);

  const step = STEPS[stepIndex];
  const docLabel = DOC_LABELS[id_type ?? "IDENTITY_CARD"] ?? "document";
  const totalSteps = STEPS.length;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>Camera access is required to continue</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (!photo?.uri) return;

    if (step.showOval) {
      // Crop selfie to a 300×300 square using the same "cover" scale math as documents
      const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
      const coverScale = Math.max(screenWidth / photo.width, screenHeight / photo.height);

      const selfieRef = await ImageManipulator.manipulate(photo.uri)
        .crop({
          originX: photo.width / 2 - SELFIE_SIZE / (2 * coverScale),
          originY: photo.height / 2 - SELFIE_SIZE / (2 * coverScale),
          width: SELFIE_SIZE / coverScale,
          height: SELFIE_SIZE / coverScale,
        })
        .renderAsync();

      const selfieResult = await selfieRef.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
      setReviewUri(selfieResult.uri);
      return;
    }

    // Crop the photo to the doc frame bounds.
    // The camera preview fills the screen using "cover" semantics — the photo is scaled
    // so its shorter side matches the screen, and the longer side is cropped at center.
    // We must replicate that scale to find where the frame sits in the actual photo.
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
    const coverScale = Math.max(screenWidth / photo.width, screenHeight / photo.height);

    const imageRef = await ImageManipulator.manipulate(photo.uri)
      .crop({
        originX: photo.width / 2 - FRAME_WIDTH / (2 * coverScale),
        originY: photo.height / 2 - FRAME_HEIGHT / (2 * coverScale),
        width: FRAME_WIDTH / coverScale,
        height: FRAME_HEIGHT / coverScale,
      })
      .renderAsync();

    const result = await imageRef.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    setReviewUri(result.uri);
  };

  const handleRetake = () => setReviewUri(null);

  const handleConfirm = () => {
    if (!reviewUri) return;
    const captured: CapturedImage = { image_type_id: step.image_type_id, image: reviewUri };
    addImage(captured);
    capturedRef.current = [...capturedRef.current, captured];
    onImageCaptured?.(captured);
    setReviewUri(null);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(capturedRef.current);
    }
  };

  const handleBack = () => {
    if (reviewUri) {
      setReviewUri(null);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const showBackButton = stepIndex > 0 || reviewUri !== null;

  return (
    <View style={styles.container}>
      {/* Camera or captured image */}
      {reviewUri ? (
        <Image source={{ uri: reviewUri }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
      ) : (
        <>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing={step.facing} />
          {step.showOval ? (
            <View style={styles.ovalWrapper} pointerEvents="none">
              <View style={styles.oval} />
            </View>
          ) : (
            <View style={styles.docFrameWrapper} pointerEvents="none">
              <View style={styles.docFrame} />
            </View>
          )}
        </>
      )}

      {/* Dark gradient overlay at top */}
      <View style={styles.topGradient} pointerEvents="none" />
      {/* Dark gradient overlay at bottom */}
      <View style={styles.bottomGradient} pointerEvents="none" />

      <SafeAreaView style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconButton} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
          <Text style={styles.stepCounter}>
            {step.stepNumber}/{totalSteps}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} hitSlop={12}>
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Instruction (only in camera mode) */}
        {!reviewUri && (
          <View style={styles.instructionContainer}>
            {step.getInstruction(docLabel)}
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {reviewUri ? (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewQuestion}>{step.reviewQuestion}</Text>
              <View style={styles.reviewButtons}>
                <TouchableOpacity style={styles.retakeButton} onPress={handleRetake} activeOpacity={0.8}>
                  <Text style={styles.retakeText}>No, retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleConfirm} activeOpacity={0.8}>
                  <Text style={styles.continueText}>Yes, continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture} activeOpacity={0.8} />
          )}
        </View>
      </SafeAreaView>

      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.submittingText}>Submitting…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Gradients
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCounter: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Instruction
  instructionContainer: {
    paddingHorizontal: Theme.spacing.xl,
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  instructionBold: {
    fontWeight: "700",
  },

  // Oval face guide
  ovalWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  oval: {
    width: 220,
    height: 290,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "transparent",
  },

  // Bottom bar
  bottomBar: {
    paddingBottom: Theme.spacing.xl,
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },

  // Review
  reviewContainer: {
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
    width: "100%",
  },
  reviewQuestion: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  reviewButtons: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    width: "100%",
  },
  retakeButton: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  retakeText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  // Permission
  permissionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
  },
  permissionButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    backgroundColor: "white",
    borderRadius: Theme.borderRadius.md,
  },
  permissionButtonText: {
    color: Theme.colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  docFrameWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  docFrame: {
    width: 300,
    height: 190,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "transparent",
  },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submittingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default KYCCameraFlow;
