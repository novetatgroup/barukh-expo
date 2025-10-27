import React, { useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import RoleSelectionForm from "../components/forms/auth/RoleSelectionForm";
import { router } from "expo-router";

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