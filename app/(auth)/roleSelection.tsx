import { router } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import RoleSelectionForm from "../components/forms/auth/RoleSelectionForm";
import { AuthContext } from "../context/AuthContext";

const RoleSelectionScreen = () => {
  const { authFetch, userId } = useContext(AuthContext);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleRoleUpdate = async (role: "TRAVELLER" | "SENDER") => {
    try {
      const response = await authFetch(`${apiUrl}/users/update/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          router.push("/(traveller)/home");
        }, 400);
      } else {
        Toast.error("Update failed. Please try again.");
      }
    } catch (error) {
      Toast.error("Network error. Try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <RoleSelectionForm onRoleSelect={handleRoleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoleSelectionScreen;
