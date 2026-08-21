import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ShipmentCodeConfirmationScreenProps = {
  title: string;
  screenTitle: string;
  subtitle: string;
  buttonLabel: string;
  submitting?: boolean;
  onBack: () => void;
  onSubmit: (code: string) => Promise<void> | void;
};

const ShipmentCodeConfirmationScreen = ({
  title,
  screenTitle,
  subtitle,
  buttonLabel,
  submitting = false,
  onBack,
  onSubmit,
}: ShipmentCodeConfirmationScreenProps) => {
  const [code, setCode] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="key-outline" size={28} color={Theme.colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/[^0-9A-Za-z]/g, "").slice(0, 12))}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          placeholder="Enter code"
          placeholderTextColor={Theme.colors.text.lightGray}
          style={styles.input}
        />

        <CustomButton
          title={buttonLabel}
          onPress={() => onSubmit(code.trim())}
          disabled={!code.trim()}
          loading={submitting}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.xxxl,
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
    justifyContent: "flex-start",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.lg,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    color: Theme.colors.text.gray,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.background.border,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    textAlign: "center",
  },
  button: {
    marginTop: Theme.spacing.xl,
  },
});

export default ShipmentCodeConfirmationScreen;
