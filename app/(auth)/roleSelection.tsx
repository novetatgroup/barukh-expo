import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import RoleSelectionForm from "../components/forms/RoleSelectionForm";

const RoleSelectionScreen = () => {
  const { authFetch } = useContext(AuthContext);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleRoleUpdate = async (role: "TRAVELLER" | "SENDER") => {
    try {
      //TODO: MOdify and place the actual route 
      const response = await authFetch(`${apiUrl}/users/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: `You are now a ${role === "TRAVELLER" ? "Traveller" : "Sender"}!`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: data.message || "Please try again",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Try again later",
      });
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