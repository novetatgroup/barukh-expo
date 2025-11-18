import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ComingSoonScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming Soon! </Text>
      <Text style={styles.subtitle}>
        Sender features are under development
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});