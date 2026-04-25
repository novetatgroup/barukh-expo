import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EnterTrackingNumberScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    itemId?: string;
    itemName?: string;
    receiptUploaded?: string;
    trackingEntered?: string;
    orderConfirmed?: string;
    verificationCompleted?: string;
  }>();
  const [trackingNumber, setTrackingNumber] = useState("");

  const trackingParams = {
    orderId: params.orderId || "#01-BK1624",
    itemId: params.itemId || "#BK1624",
    itemName: params.itemName || "MacBook Pro",
    receiptUploaded: params.receiptUploaded || "false",
    trackingEntered: params.trackingEntered || "false",
    orderConfirmed: params.orderConfirmed || "false",
    verificationCompleted: params.verificationCompleted || "false",
  };

  const handleSubmit = () => {
    const value = trackingNumber.trim();

    if (!value) {
      Alert.alert("Tracking number required", "Enter the tracking number to continue.");
      return;
    }

    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: {
        ...trackingParams,
        trackingEntered: "true",
        trackingNumber: value,
      },
    });
  };

  const handleBack = () => {
    router.replace({
      pathname: "/(sender)/trackingDetails",
      params: trackingParams,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Tracking Number</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Tracking Number"
            placeholderTextColor={Theme.colors.text.lightGray}
            style={styles.input}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 96,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.xl,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
});

export default EnterTrackingNumberScreen;
