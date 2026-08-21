import Theme from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  text?: string;
};

const SampleDataBanner = ({
  text = "Sample data — waiting for backend endpoint",
}: Props) => (
  <View style={styles.container}>
    <Ionicons name="information-circle-outline" size={16} color={Theme.colors.primary} />
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.yellow,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
    color: Theme.colors.primary,
  },
});

export default SampleDataBanner;
