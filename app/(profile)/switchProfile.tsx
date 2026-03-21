import Theme from "@/constants/Theme";
import { ROLES, Role } from "@/constants/roles";
import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";

const SwitchProfileScreen = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const { role, setRole } = useRole();
  const [isLoading, setIsLoading] = useState(false);

  const targetRole: Role =
    role === ROLES.TRAVELLER ? ROLES.SENDER : ROLES.TRAVELLER;
  const targetLabel =
    targetRole === ROLES.SENDER ? "Sender Mode" : "Traveller Mode";

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (!userId || !accessToken) {
      Toast.error("Session error. Please log in again.");
      setIsLoading(false);
      return;
    }

    const { error, ok } = await userService.updateRole(
      userId,
      targetRole,
      accessToken
    );

    if (ok) {
      Toast.success("Role updated successfully!");
      await setRole(targetRole);
      router.replace("/(tabs)/home");
    } else {
      Toast.error(error || "Update failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} style={styles.headerSide}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Switch Profile</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="swap-horizontal"
            size={40}
            color={Theme.colors.yellow}
          />
        </View>

        <Text style={styles.message}>
          You are about to switch Profile to {targetLabel}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace("/(tabs)/profile")}
            disabled={isLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmText}>
              {isLoading ? "Switching..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.xxxxl,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  headerSide: {
    width: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  message: {
    fontSize: 24,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: Theme.spacing.xxl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: Theme.components.button.height,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: Theme.components.button.height,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default SwitchProfileScreen;
