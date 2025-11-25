import React from "react";
import {View, StyleSheet} from "react-native";
import AddDetailsForm from "../components/forms/KYC/AddDetailsForm";
import { router } from "expo-router";

const AddDetailsScreen = () => {
    //TODO: implement api call

    const handleSubmit = async (data: {
        fullName: string;
        address1: string;
        address2: string;
        country:string;
        state:string;
        city:string;
        email: string;
        emergencyContact: string
    }) => {
        console.log("Traveller Details submitted:", data);

         router.push("/(KYC)/docuTypeScreen");
       
    };

    return (
        <View style={styles.container}>
            <AddDetailsForm onSubmit={handleSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});


export default AddDetailsScreen;