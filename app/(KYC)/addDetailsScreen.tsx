import { AuthContext } from "@/app/context/AuthContext";
import { UserProfile, userService } from "@/app/services/userService";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import AddDetailsForm from "../components/forms/KYC/AddDetailsForm";

const AddDetailsScreen = () => {
    const { userId, accessToken } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId || !accessToken) return;
            const { data, ok } = await userService.getUser(userId, accessToken);
            if (ok && data) setUserProfile(data);
        };
        fetchUser();
    }, [userId, accessToken]);

    return (
        <View style={styles.container}>
            <AddDetailsForm
                initialData={userProfile}
                onSuccess={() => router.push("/(KYC)/docuTypeScreen")}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default AddDetailsScreen;
