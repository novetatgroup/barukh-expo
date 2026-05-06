import { Theme } from "@/constants/Theme";
import { ChatContext, Conversation } from "@/context/ChatContext";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ChatFilter = "all" | "unread" | "notifications";

const filters: { key: ChatFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "notifications", label: "Notifications" },
];

const avatarColors = [
  Theme.colors.yellow,
  Theme.colors.lightGreen,
  Theme.colors.background.border,
  Theme.colors.lightPurple,
  Theme.colors.primary,
  Theme.colors.orange,
];

const getAvatarColor = (value: string) => {
  const total = value
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return avatarColors[total % avatarColors.length];
};

const ConversationRow = ({
  item,
  myUserId,
}: {
  item: Conversation;
  myUserId: string | null;
}) => {
  const otherId = item.participants.find((p) => p !== myUserId) ?? item.participants[0];
  const initials = otherId.slice(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(item.conversationId || otherId);
  const avatarTextColor =
    avatarColor === Theme.colors.primary || avatarColor === Theme.colors.lightPurple
      ? Theme.colors.white
      : Theme.colors.primary;

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
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.75}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={[styles.avatarText, { color: avatarTextColor }]}>{initials}</Text>
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
  const { conversations, refreshConversations } = useContext(ChatContext);
  const { userId } = useContext(AuthContext);
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("all");
  const unreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );
  const filteredConversations = useMemo(() => {
    if (activeFilter === "unread") {
      return conversations.filter((conversation) => conversation.unreadCount > 0);
    }

    if (activeFilter === "notifications") {
      return [];
    }

    return conversations;
  }, [activeFilter, conversations]);
  const emptyCopy =
    activeFilter === "unread"
      ? "Unread conversations will appear here."
      : activeFilter === "notifications"
      ? "Chat notifications will appear here."
      : "Your conversations will appear here.";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          My <Text style={styles.titleHighlight}>Chat</Text>
        </Text>

        <View style={styles.filterBar}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            const count =
              filter.key === "all"
                ? conversations.length
                : filter.key === "unread"
                ? unreadCount
                : 0;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                  numberOfLines={1}
                >
                  {filter.label}
                </Text>
                {isActive && count > 0 ? (
                  <View style={styles.filterCountBadge}>
                    <Text style={styles.filterCountText}>{count}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.listPanel}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={44}
                color={Theme.colors.text.gray}
              />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>{emptyCopy}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.conversationId}
            renderItem={({ item }) => (
              <ConversationRow item={item} myUserId={userId} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshConversations}
            refreshing={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  header: {
    paddingTop: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: 27,
    fontFamily: "Inter-Regular",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xl,
  },
  titleHighlight: {
    fontFamily: "Inter-Bold",
  },
  filterBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: Theme.colors.white,
    padding: 4,
  },
  filterPill: {
    flex: 1,
    height: 34,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: Theme.spacing.sm,
  },
  activeFilterPill: {
    backgroundColor: Theme.colors.green,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.lightGray,
  },
  activeFilterText: {
    color: Theme.colors.white,
    fontFamily: "Inter-SemiBold",
  },
  filterCountBadge: {
    minWidth: 20,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterCountText: {
    fontSize: 9,
    fontFamily: "Inter-Bold",
    color: Theme.colors.green,
  },
  listPanel: {
    flex: 1,
    marginTop: Theme.spacing.sm,
    backgroundColor: Theme.colors.white,
  },
  list: {
    paddingBottom: 142,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
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
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  rowTime: {
    fontSize: 9,
    color: Theme.colors.text.lightGray,
    fontFamily: "Inter-Regular",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowPreview: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    fontFamily: "Inter-Regular",
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  badge: {
    minWidth: 22,
    height: 15,
    borderRadius: 8,
    backgroundColor: Theme.colors.green,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: 9,
    fontFamily: "Inter-Bold",
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
    marginLeft: 88,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: 142,
  },
  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
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
