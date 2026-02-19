import { AuthContext } from "@/app/context/AuthContext";
import { userService } from "@/app/services/userService";
import { router } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import AddDetailsForm from "../components/forms/KYC/AddDetailsForm";

const AddDetailsScreen = () => {
    const { userId, accessToken } = useContext(AuthContext);

    const handleSubmit = async (data: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        emergencyContact: string;
        city: string;
        country: string;
    }) => {
        if (!userId || !accessToken) return;

        const { ok, error } = await userService.updateProfile(userId, data, accessToken);
        if (ok) {
            Toast.success("Details saved successfully!");
            router.push("/(KYC)/docuTypeScreen");
        } else {
            Toast.error(error || "Failed to save details.");
        }
    };

    return (
        <View style={styles.container}>
            <AddDetailsForm onSubmit={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default AddDetailsScreen;
