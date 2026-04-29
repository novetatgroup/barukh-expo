import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ShareShipmentCodeScreenProps = {
  codeType: "pickup" | "delivery";
  itemName: string;
  shipmentId?: string;
  initiallyShared?: boolean;
  onBack: (hasShared: boolean) => void;
  onFetchCode: () => Promise<string>;
};

const ShareShipmentCodeScreen = ({
  codeType,
  itemName,
  shipmentId,
  initiallyShared = false,
  onBack,
  onFetchCode,
}: ShareShipmentCodeScreenProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasShared, setHasShared] = useState(initiallyShared);

  const content = useMemo(() => {
    if (codeType === "pickup") {
      return {
        title: "Share Pickup Code",
        badgeLabel: "Pickup handoff",
        description:
          "When the traveller arrives to collect the package, fetch the pickup code and read it out loud.",
        buttonLabel: code ? "Refresh Pickup Code" : "Get Pickup Code",
        shareLabel: "Share Pickup Code",
        shareMessage: `Pickup code for ${itemName}:`,
      };
    }

    return {
      title: "Share Delivery Code",
      badgeLabel: "Delivery handoff",
      description:
        "After reviewing the proof-of-delivery photo, fetch the delivery code and share it with the traveller to close the trip.",
      buttonLabel: code ? "Refresh Delivery Code" : "Get Delivery Code",
      shareLabel: "Share Delivery Code",
      shareMessage: `Delivery code for ${itemName}:`,
    };
  }, [code, codeType, itemName]);

  const handleFetchCode = async () => {
    if (!shipmentId) {
      Alert.alert("Shipment unavailable", "Open this step from a shipment with a valid ID.");
      return;
    }

    try {
      setLoading(true);
      const nextCode = await onFetchCode();
      setCode(nextCode);
      setHasShared(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch the shipment code right now.";
      Alert.alert("Code unavailable", message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!code) {
      Alert.alert("No code yet", "Fetch the code before sharing it.");
      return;
    }

    try {
      await Share.share({
        message: `${content.shareMessage} ${code}`,
      });
    } catch (error) {
      console.error("Share shipment code error:", error);
      Alert.alert("Share failed", "Unable to open the share sheet right now.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack(hasShared)} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="key-outline" size={24} color={Theme.colors.primary} />
          </View>

          <Text style={styles.badge}>{content.badgeLabel}</Text>
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.description}>{content.description}</Text>

          <Text style={styles.codeLabel}>Shipment code</Text>
          <TextInput
            value={code}
            editable={false}
            selectTextOnFocus
            placeholder="Tap the button below to fetch the code"
            placeholderTextColor={Theme.colors.text.lightGray}
            style={styles.codeInput}
          />
          <Text style={styles.helperText}>
            The code is selectable, so it can be copied, or you can use the share action below.
          </Text>

          <CustomButton
            title={content.buttonLabel}
            onPress={handleFetchCode}
            loading={loading}
            disabled={loading || !shipmentId}
            style={styles.primaryButton}
          />

          <CustomButton
            title={content.shareLabel}
            onPress={handleShareCode}
            disabled={!code || loading}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal,
    paddingTop: Theme.spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Theme.spacing.lg,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.md,
  },
  badge: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  itemName: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
  },
  codeLabel: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  codeInput: {
    minHeight: 56,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    letterSpacing: 2,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    lineHeight: 18,
    marginTop: Theme.spacing.sm,
  },
  primaryButton: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },
  secondaryButton: {
    marginBottom: 0,
  },
});

export default ShareShipmentCodeScreen;
