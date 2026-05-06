# Chat Module Integration Guide

This app uses the Barukh chat Socket.IO namespace at:

```text
EXPO_PUBLIC_CHAT_URL=wss://chat.staging.api.barukhconnector.com/chat
```

The backend is Socket.IO, not a plain WebSocket server. In the app, use `socket.io-client`. In Bruno, use raw Socket.IO frames because Bruno's WebSocket client is raw WebSocket only.

## Bruno Test Collection

Collection path:

```text
bruno/chat-websocket
```

Open it in Bruno with **Collection -> Open Collection**, then select the `staging` environment.

### Variables to set

Set these before testing:

- `loginEmail`: a real staging user email.
- `otpCode`: OTP received for that email.
- `receiverId`: the other user's `userId`.
- `currentUserId`: the authenticated user's `userId`.
- `conversationId`: `[currentUserId, receiverId].sort().join("_")`.
- `messageContent`: text to send.
- `messageId`: set this after receiving a `message:new` or `message:sent` response.

### Bruno auth flow

1. Run `01 Auth - Request Login OTP`.
2. Copy the OTP into `otpCode`.
3. Run `02 Auth - Verify OTP`.
4. Confirm the collection saved `accessToken`.

### Bruno Socket.IO flow

1. Open `03 Socket.IO - Auth Session`.
2. Connect. The server should emit an Engine.IO open packet beginning with `0`.
3. Send the auth frame:

```text
40/chat,{"token":"<accessToken>"}
```

4. After the namespace is connected, send event frames in that same WebSocket session:

```text
42/chat,["conversations:fetch"]
42/chat,["messages:fetch",{"conversationId":"<conversationId>","limit":50}]
42/chat,["message:send",{"recieverId":"<receiverId>","content":"Hello from Bruno"}]
42/chat,["message:delivered",{"messageId":"<messageId>"}]
42/chat,["message:seen",{"messageId":"<messageId>"}]
42/chat,["typing:start",{"receiverId":"<receiverId>"}]
42/chat,["typing:stop",{"receiverId":"<receiverId>"}]
42/chat,["user:online",{"userId":"<receiverId>"}]
42/chat,["heartbeat"]
```

The `05 Frame` through `13 Frame` YAML files are templates for the message body. Use their `websocket.message.data` values in the authenticated WebSocket tab opened by `03 Socket.IO - Auth Session`.

If the server sends Engine.IO ping packet `2`, reply with:

```text
3
```

Expected server events:

- `connected`: `{ userId, timestamp }`
- `message:sent`: `{ messageId, status, timestamp }`
- `message:new`: `{ messageId, senderId, receiverId, content, status, createdAt }`
- `receipt:delivered`: `{ messageId, deliveredAt }`
- `receipt:read`: `{ messageId, readAt }`
- `typing:user`: `{ userId, typing }`
- `user:online-status`: `{ userId, online, lastSeen }`
- `messages:history`: `{ messages, count }`
- `conversations:list`: `{ conversations, count }`
- `heartbeat:ack`: `{ timestamp }`

## App Integration Checklist

1. Install and keep `socket.io-client`.

```bash
npm install socket.io-client
```

2. Keep the chat URL in `.env`.

```text
EXPO_PUBLIC_CHAT_URL=wss://chat.staging.api.barukhconnector.com/chat
```

3. Mount `ChatProvider` after `AuthProvider` so the provider can read `accessToken`, `isAuthenticated`, and `userId`.

4. Connect only after authentication:

```ts
const socket = io(process.env.EXPO_PUBLIC_CHAT_URL!, {
  auth: { token: accessToken },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10_000,
  timeout: 5_000,
});
```

5. On `connected`, start a 30 second app heartbeat and fetch conversations.

```ts
socket.on("connected", () => {
  socket.emit("conversations:fetch");
  heartbeatRef.current = setInterval(() => socket.emit("heartbeat"), 30_000);
});
```

6. On `message:new`, immediately emit delivery and refresh the conversation list.

```ts
socket.on("message:new", (msg) => {
  socket.emit("message:delivered", { messageId: msg.messageId });
  socket.emit("conversations:fetch");
});
```

7. When a conversation screen is visible, mark received messages as seen only after delivery.

```ts
socket.emit("message:delivered", { messageId });
setTimeout(() => socket.emit("message:seen", { messageId }), 100);
```

8. Send messages with the backend's current misspelled field name:

```ts
socket.emit("message:send", {
  recieverId: receiverId,
  content: trimmed,
});
```

The field is currently `recieverId`, not `receiverId`. Using the corrected spelling for `message:send` will not work until the backend fixes the contract. Typing events still use `receiverId`.

9. Fetch history when opening a chat and on reconnect:

```ts
socket.emit("messages:fetch", { conversationId, limit: 50 });
```

10. Derive a new conversation ID before the first history fetch if the list does not have one yet:

```ts
const conversationId = [myUserId, receiverId].sort().join("_");
```

11. Route into chat with string-safe params:

```ts
router.push({
  pathname: "/(chat)/[conversationId]",
  params: {
    conversationId,
    receiverId,
    receiverName,
  },
});
```

12. On logout or token expiry, disconnect the socket, clear heartbeat timers, and remove listeners.

## Current App Notes

- `context/ChatContext.tsx` already handles connection, conversation fetching, message delivery, and heartbeat.
- `app/(chat)/[conversationId].tsx` already handles history, optimistic send, typing, receipts, and read status.
- The send payload must use `recieverId` for `message:send`.
- The conversation list can only show existing conversations. To start a new chat from a match or shipment, route with the deterministic conversation ID and the target `receiverId`.
