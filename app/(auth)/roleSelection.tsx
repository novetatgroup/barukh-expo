import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import RoleSelectionForm from "../components/forms/auth/RoleSelectionForm";
import { Role } from "../constants/roles";
import { AuthContext } from "../context/AuthContext";

const RoleSelectionScreen = () => {
  const { authFetch, userId } = useContext(AuthContext);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleUpdate = async (role: Role) => {
    setSelectedRole(role);

    try {
      const response = await authFetch(`${apiUrl}/users/update/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setTimeout(() => {
          if (role === "TRAVELLER") {
            router.push("/(traveller)/home");
          } else if (role === "SENDER") {
            router.push("/(sender)/coming-soon"); 
          } else {
            Toast.error("Invalid role selected");
            setSelectedRole(null);
          }
        }, 400);
      } else {
        const data = await response.json();
        console.error("API Error:", data);
        Toast.error(data.message || "Update failed. Please try again.");
        setSelectedRole(null);
      }
    } catch (error) {
      console.error("Network Error:", error);
      Toast.error("Network error. Try again later.");
      setSelectedRole(null);
    }
  };

  return (
    <View style={styles.container}>
      <RoleSelectionForm
        selectedRole={selectedRole}
        onRoleSelect={handleRoleUpdate}
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
