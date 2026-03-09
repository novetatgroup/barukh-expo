import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

const CHAT_URL = "https://chat.staging.api.barukhconnector.com/chat";
const HEARTBEAT_INTERVAL = 30_000;

export interface Conversation {
  conversationId: string;
  participants: string[];
  lastMessage: { id: string; content: string; at: string } | null;
  unreadCount: number;
  lastReadAt: string | null;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

interface ChatContextType {
  socket: Socket | null;
  connected: boolean;
  conversations: Conversation[];
  refreshConversations: () => void;
}

export const ChatContext = createContext<ChatContextType>({
  socket: null,
  connected: false,
  conversations: [],
  refreshConversations: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const newSocket = io(CHAT_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      timeout: 5_000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => {
      setConnected(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    });

    newSocket.on("connected", () => {
      newSocket.emit("conversations:fetch");
      heartbeatRef.current = setInterval(
        () => newSocket.emit("heartbeat"),
        HEARTBEAT_INTERVAL
      );
    });

    newSocket.on(
      "conversations:list",
      (data: { conversations: Conversation[] }) => {
        setConversations(data.conversations ?? []);
      }
    );

    // Refresh conversation list on any incoming message so unread counts stay current
    newSocket.on("message:new", () => {
      newSocket.emit("conversations:fetch");
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Chat connect error:", err.message);
    });

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  const refreshConversations = () => {
    socket?.emit("conversations:fetch");
  };

  return (
    <ChatContext.Provider
      value={{ socket, connected, conversations, refreshConversations }}
    >
      {children}
    </ChatContext.Provider>
  );
};
