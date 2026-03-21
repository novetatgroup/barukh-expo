import Theme from "@/constants/Theme";
import { ChatContext, Conversation } from "@/context/ChatContext";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ConversationRow = ({
  item,
  myUserId,
}: {
  item: Conversation;
  myUserId: string | null;
}) => {
  const otherId = item.participants.find((p) => p !== myUserId) ?? item.participants[0];
  const initials = otherId.slice(0, 2).toUpperCase();

  const handlePress = () => {
    router.push({
      pathname: "/(chat)/[conversationId]",
      params: {
        conversationId: item.conversationId,
        receiverId: otherId,
        receiverName: otherId,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>
            {otherId}
          </Text>
          {item.lastMessage && (
            <Text style={styles.rowTime}>
              {new Date(item.lastMessage.at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.rowPreview} numberOfLines={1}>
            {item.lastMessage?.content ?? "No messages yet"}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ChatListScreen = () => {
  const { conversations } = useContext(ChatContext);
  const { userId } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      {conversations.length === 0 ? (
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
            Your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId}
          renderItem={({ item }) => (
            <ConversationRow item={item} myUserId={userId} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop: Theme.spacing.xxxxl,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.screenPadding.horizontal,
  },
  list: {
    paddingHorizontal: Theme.screenPadding.horizontal,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  rowContent: {
    flex: 1,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  rowName: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  rowTime: {
    fontSize: 12,
    color: Theme.colors.text.lightGray,
    fontFamily: "Inter-Regular",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowPreview: {
    fontSize: 13,
    color: Theme.colors.text.gray,
    fontFamily: "Inter-Regular",
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.text.border,
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

export default ChatListScreen;
