import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import RoleSelectionForm from "../components/forms/auth/RoleSelectionForm";
import { Role } from "../constants/roles";
import { AuthContext } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { userService } from "../services/userService";

const RoleSelectionScreen = () => {
  const { userId, accessToken } = useContext(AuthContext);
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleUpdate = async (role: Role) => {
    if (isLoading) return;

    setSelectedRole(role);
    setIsLoading(true);

    if (!userId || !accessToken) {
      Toast.error("Session error. Please log in again.");
      setSelectedRole(null);
      setIsLoading(false);
      return;
    }

    const { error, ok } = await userService.updateRole(userId, role, accessToken);

    if (ok) {
      Toast.success("Role updated successfully!");
      await setRole(role);
      router.replace("/(tabs)/home");
    } else {
      Toast.error(error || "Update failed. Please try again.");
      setSelectedRole(null);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <RoleSelectionForm
        selectedRole={selectedRole}
        onRoleSelect={handleRoleUpdate}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoleSelectionScreen;
