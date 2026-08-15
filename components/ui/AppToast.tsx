import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ToastConfig, ToastConfigParams, ToastType } from "toastify-react-native/utils/interfaces";

type ToastVariant = {
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
};

// A solid, branded dark card (matching the app's primary header cards on
// Home/Onboarding) reads clearly against any screen background, unlike a
// white card which blended into the mostly-white/light screens.
const VARIANTS: Record<ToastType, ToastVariant> = {
  success: { icon: "checkmark-circle", accentColor: Theme.colors.yellow },
  error: { icon: "alert-circle", accentColor: "#FF6B6B" },
  warn: { icon: "warning", accentColor: Theme.colors.orange },
  info: { icon: "information-circle", accentColor: "#6EC1FF" },
  default: { icon: "information-circle", accentColor: Theme.colors.yellow },
};

const AppToastCard = ({ text1, text2, type, hide }: ToastConfigParams) => {
  const variant = VARIANTS[type || "default"] || VARIANTS.default;

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: variant.accentColor }]} />

      <View style={[styles.iconContainer, { backgroundColor: variant.accentColor }]}>
        <Ionicons name={variant.icon} size={18} color={Theme.colors.primary} />
      </View>

      <View style={styles.textContainer}>
        {text1 ? (
          <Text style={styles.title} numberOfLines={2}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text style={styles.message} numberOfLines={3}>
            {text2}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={hide} hitSlop={8} style={styles.closeButton}>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => <AppToastCard {...props} />,
  error: (props) => <AppToastCard {...props} />,
  warn: (props) => <AppToastCard {...props} />,
  info: (props) => <AppToastCard {...props} />,
  default: (props) => <AppToastCard {...props} />,
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "92%",
    alignSelf: "center",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    overflow: "hidden",
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
  message: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.75)",
  },
  closeButton: {
    padding: 2,
  },
});
