import Theme from "@/constants/Theme";
import { ChatContext, ChatMessage } from "@/context/ChatContext";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const ChatScreen = () => {
  const { conversationId, receiverId, receiverName } = useLocalSearchParams<{
    conversationId: string;
    receiverId: string;
    receiverName: string;
  }>();

  const { socket } = useContext(ChatContext);
  const { userId } = useContext(AuthContext);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch history on mount + reconnect ──────────────────────────────────
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleHistory = (data: { messages: ChatMessage[]; count: number }) => {
      const ordered = [...data.messages].reverse();
      setMessages(ordered);
      setHistoryLoaded(true);
      // Mark any received messages in history as seen (after delivery delay)
      ordered.forEach((msg) => {
        if (msg.receiverId === userId) {
          setTimeout(() => socket.emit("message:seen", { messageId: msg.messageId }), 100);
        }
      });
    };

    const fetchMessages = () => {
      socket.emit("messages:fetch", { conversationId, limit: 50 });
    };

    // Fallback: if server doesn't respond (e.g. conversation doesn't exist yet), unblock UI
    const fallback = setTimeout(() => setHistoryLoaded(true), 3000);

    socket.on("messages:history", handleHistory);
    socket.on("connect", fetchMessages);
    fetchMessages();

    return () => {
      clearTimeout(fallback);
      socket.off("messages:history", handleHistory);
      socket.off("connect", fetchMessages);
    };
  }, [socket, conversationId, userId]);

  // ── Incoming messages ────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.senderId !== receiverId && msg.senderId !== userId) return;
      if (msg.receiverId !== userId && msg.receiverId !== receiverId) return;

      setMessages((prev) => [...prev, msg]);
      socket.emit("message:delivered", { messageId: msg.messageId });
      // Delay message:seen so the server has time to process message:delivered first
      setTimeout(() => socket.emit("message:seen", { messageId: msg.messageId }), 100);
    };

    socket.on("message:new", handleNewMessage);
    return () => { socket.off("message:new", handleNewMessage); };
  }, [socket, receiverId, userId]);

  // ── Sent confirmation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleSent = (data: { messageId: string; status: string; timestamp: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === "pending" ? { ...m, messageId: data.messageId, status: "sent" } : m
        )
      );
    };

    socket.on("message:sent", handleSent);
    return () => { socket.off("message:sent", handleSent); };
  }, [socket]);

  // ── Receipt updates ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleDelivered = (r: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => m.messageId === r.messageId ? { ...m, status: "delivered" } : m)
      );
    };
    const handleRead = (r: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => m.messageId === r.messageId ? { ...m, status: "read" } : m)
      );
    };

    socket.on("receipt:delivered", handleDelivered);
    socket.on("receipt:read", handleRead);
    return () => {
      socket.off("receipt:delivered", handleDelivered);
      socket.off("receipt:read", handleRead);
    };
  }, [socket]);

  // ── Typing indicator ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: { userId: string; typing: boolean }) => {
      if (data.userId === receiverId) setIsTyping(data.typing);
    };

    socket.on("typing:user", handleTyping);
    return () => { socket.off("typing:user", handleTyping); };
  }, [socket, receiverId]);

  // ── Sending ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !socket || !receiverId) return;

    // Optimistic message
    const optimistic: ChatMessage = {
      messageId: "pending",
      senderId: userId ?? "",
      receiverId,
      content: trimmed,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");

    socket.emit("message:send", { recieverId: receiverId, content: trimmed });
    socket.emit("typing:stop", { receiverId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [text, socket, receiverId, userId]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (!socket || !receiverId) return;

    socket.emit("typing:start", { receiverId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId });
    }, 2000);
  };

  // ── Status icon ──────────────────────────────────────────────────────────
  const StatusIcon = ({ status }: { status: ChatMessage["status"] }) => {
    if (status === "read") return <Ionicons name="checkmark-done" size={14} color={Theme.colors.green} />;
    if (status === "delivered") return <Ionicons name="checkmark-done" size={14} color={Theme.colors.text.lightGray} />;
    return <Ionicons name="checkmark" size={14} color={Theme.colors.text.lightGray} />;
  };

  // ── Render message ───────────────────────────────────────────────────────
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === userId;
    return (
      <View style={[styles.messageBubbleWrapper, isMine ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.bubbleText, isMine ? styles.myText : styles.theirText]}>
            {item.content}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            {isMine && <StatusIcon status={item.status} />}
          </View>
        </View>
      </View>
    );
  };

  const displayName = receiverName ?? "Traveller";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{displayName}</Text>
          {isTyping && <Text style={styles.typingText}>typing...</Text>}
        </View>
      </View>

      {/* Messages */}
      {!historyLoaded ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.messageId + index}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                Say hello to {displayName}!
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor={Theme.colors.text.lightGray}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color={Theme.colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 56,
    paddingBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.text.border,
  },
  backButton: {
    marginRight: Theme.spacing.sm,
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5D6A8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.sm,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.primary,
    fontFamily: "Inter-SemiBold",
  },
  typingText: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyMessagesText: {
    color: Theme.colors.text.gray,
    fontSize: 14,
  },
  messageBubbleWrapper: {
    marginVertical: 3,
    maxWidth: "75%",
  },
  myWrapper: {
    alignSelf: "flex-end",
  },
  theirWrapper: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  myBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Theme.colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  myText: {
    color: Theme.colors.white,
  },
  theirText: {
    color: Theme.colors.text.dark,
  },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
  },
  myTimeText: {
    color: "rgba(255,255,255,0.6)",
  },
  theirTimeText: {
    color: Theme.colors.text.lightGray,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 28 : Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.text.border,
    gap: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#F4F1F2",
    borderRadius: 22,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: Theme.colors.text.dark,
    fontFamily: "Inter-Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

export default ChatScreen;
