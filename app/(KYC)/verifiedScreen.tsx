import Theme from "@/constants/Theme";
import CustomButton from "@/components/ui/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VerifiedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={36} color={Theme.colors.yellow} />
        </View>
        <Text style={styles.title}>
          {"Account\n"}
          <Text style={styles.titleBold}>Verified</Text>
        </Text>
        <Text style={styles.body}>
          Your identity has already been verified. You have full access to Barukh.
        </Text>
        <CustomButton
          title="Go Home"
          variant="primary"
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f2",
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.screenPadding.horizontal,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 40,
    textAlign: "center",
  },
  titleBold: {
    fontWeight: "700",
  },
  body: {
    ...Theme.typography.body,
    fontSize: 15,
    color: Theme.colors.text.gray,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  button: {
    width: "100%",
    marginTop: Theme.spacing.lg,
  },
});
