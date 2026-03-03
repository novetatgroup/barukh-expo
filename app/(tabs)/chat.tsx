import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      <View style={styles.emptyState}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={64}
            color={Theme.colors.text.gray}
          />
        </View>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptyText}>
          Your conversations  will appear here.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
    paddingTop: Theme.spacing.xxxxl,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: Theme.spacing.xxxxxxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.background.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    textAlign: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
});

export default ChatScreen;
