import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { chatService, messageService } from "../services/chatService";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, joinChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: [{ userId, name }] }
  const [notification, setNotification] = useState([]); // unread messages

  // ─── Load Chats ─────────────────────────────────────────────────────────────
  const loadChats = useCallback(async () => {
    if (!user) return;
    setLoadingChats(true);
    try {
      const data = await chatService.getChats();
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats:", err.message);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  // ─── Load Messages ───────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (chatId, page = 1) => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getMessages(chatId, page);
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }
      setPagination(data.pagination);
      return data;
    } catch (err) {
      console.error("Failed to load messages:", err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ─── Select Chat ─────────────────────────────────────────────────────────────
  const selectChat = useCallback(
    async (chat) => {
      setSelectedChat(chat);
      setMessages([]);
      if (chat) {
        joinChat(chat._id);
        await loadMessages(chat._id, 1);
        // Mark messages as read
        await messageService.markAsRead(chat._id).catch(() => {});
        // Remove from notifications
        setNotification((prev) => prev.filter((n) => n.chat._id !== chat._id));
      }
    },
    [joinChat, loadMessages]
  );

  // ─── Socket: Incoming Messages ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Add to messages if current chat
      if (selectedChat && message.chat._id === selectedChat._id) {
        setMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
        // Auto-mark as read
        messageService.markAsRead(selectedChat._id).catch(() => {});
      } else {
        // Add notification badge
        setNotification((prev) => {
          const exists = prev.some((n) => n._id === message._id);
          return exists ? prev : [message, ...prev];
        });
      }

      // Update latest message in chat list
      setChats((prev) =>
        prev.map((c) =>
          c._id === message.chat._id
            ? { ...c, latestMessage: message, updatedAt: message.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    socket.on("message:received", handleNewMessage);
    return () => socket.off("message:received", handleNewMessage);
  }, [socket, selectedChat]);

  // ─── Socket: Typing Indicators ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = ({ userId, name, chatId }) => {
      setTypingUsers((prev) => {
        const current = prev[chatId] || [];
        const exists = current.some((u) => u.userId === userId);
        if (exists) return prev;
        return { ...prev, [chatId]: [...current, { userId, name }] };
      });
    };

    const handleTypingStop = ({ userId, chatId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter((u) => u.userId !== userId),
      }));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket]);

  // ─── Socket: Read Receipts ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleRead = ({ chatId, userId }) => {
      if (selectedChat?._id === chatId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const alreadyRead = msg.readBy?.some(
              (r) => r.user === userId || r.user?._id === userId
            );
            if (!alreadyRead) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { user: userId, readAt: new Date() }],
              };
            }
            return msg;
          })
        );
      }
    };

    socket.on("messages:read", handleRead);
    return () => socket.off("messages:read", handleRead);
  }, [socket, selectedChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        selectChat,
        messages,
        setMessages,
        loadChats,
        loadMessages,
        loadingChats,
        loadingMessages,
        pagination,
        typingUsers,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};