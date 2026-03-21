import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_URL!;
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

    console.log("[Chat] connecting with token:", accessToken ? `${accessToken.slice(0, 20)}...` : "NULL");
    const newSocket = io(CHAT_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      timeout: 5_000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => { console.log("[Chat] socket connected"); setConnected(true); });
    newSocket.on("disconnect", () => {
      console.log("[Chat] socket disconnected");
      setConnected(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    });

    newSocket.on("connected", (data: unknown) => {
      console.log("[Chat] server connected event:", JSON.stringify(data));
      newSocket.emit("conversations:fetch");
      heartbeatRef.current = setInterval(
        () => newSocket.emit("heartbeat"),
        HEARTBEAT_INTERVAL
      );
    });

    newSocket.on(
      "conversations:list",
      (data: unknown) => {
        console.log("[Chat] conversations:list raw:", JSON.stringify(data));
        const payload = data as { conversations?: Conversation[] };
        setConversations(payload.conversations ?? []);
      }
    );

    // Refresh conversation list when a message is sent or received
    newSocket.on("message:new", () => {
      newSocket.emit("conversations:fetch");
    });
    newSocket.on("message:sent", () => {
      newSocket.emit("conversations:fetch");
    });

    newSocket.on("connect_error", (err) => {
      console.warn("[Chat] connect_error:", err.message);
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
