import { motion } from "framer-motion";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../shared/Avatar";
import {
  getChatName,
  getChatAvatar,
  getOtherUser,
  formatTime,
  truncateText,
} from "../../utils/helpers";

export default function ChatList({ onChatSelect }) {
  const { chats, selectedChat, selectChat, loadingChats, notification } = useChat();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  const getUnreadCount = (chatId) =>
    notification.filter((n) => n.chat?._id === chatId || n.chat === chatId).length;

  if (loadingChats) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-wa-dark-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-wa-dark-hover rounded-full w-3/4" />
              <div className="h-2.5 bg-gray-200 dark:bg-wa-dark-hover rounded-full w-1/2" />
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-wa-dark-hover rounded-full w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (!chats.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-40 text-center px-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl mb-3"
        >
          💬
        </motion.div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No chats yet. Start a new conversation!
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {chats.map((chat, i) => {
        const name = getChatName(chat, user._id);
        const avatar = getChatAvatar(chat, user._id);
        const otherUser = getOtherUser(chat, user._id);
        const isSelected = selectedChat?._id === chat._id;
        const unread = getUnreadCount(chat._id);
        const online = otherUser ? isUserOnline(otherUser._id) : false;

        const latestMsg = chat.latestMessage;
        let preview = "No messages yet";
        let previewPrefix = "";
        if (latestMsg) {
          if (latestMsg.type === "image") preview = "📷 Photo";
          else if (latestMsg.type === "file") preview = `📎 ${latestMsg.fileName || "File"}`;
          else preview = truncateText(latestMsg.content, 38);
          
          // Show sender name in group chats
          if (chat.isGroupChat && latestMsg.sender) {
            const senderName = latestMsg.sender._id === user._id ? "You" : latestMsg.sender.name?.split(" ")[0];
            previewPrefix = senderName ? `${senderName}: ` : "";
          }
        }

        return (
          <motion.button
            key={chat._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3 }}
            onClick={() => {
              selectChat(chat);
              onChatSelect?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative border-b border-gray-100 dark:border-wa-dark-border/50 ${
              isSelected
                ? "bg-gray-100 dark:bg-wa-dark-hover"
                : "hover:bg-gray-50 dark:hover:bg-wa-dark-hover/50"
            }`}
          >
            <Avatar
              name={name}
              src={avatar}
              size="lg"
              showOnline={!chat.isGroupChat}
              isOnline={online}
            />

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100 truncate">
                  {name}
                </span>
                {latestMsg && (
                  <span className={`text-[11px] flex-shrink-0 ml-2 ${
                    unread > 0 ? "text-primary-500 font-semibold" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {formatTime(latestMsg.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-[13px] truncate pr-2 ${
                  unread > 0
                    ? "text-gray-800 dark:text-gray-200 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {/* Double check for own messages */}
                  {latestMsg && latestMsg.sender?._id === user._id && (
                    <span className="text-wa-blue-check mr-1 text-xs">✓✓</span>
                  )}
                  <span className="text-primary-600 dark:text-primary-400">{previewPrefix}</span>
                  {preview}
                </p>
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[11px] flex items-center justify-center font-bold"
                  >
                    {unread > 99 ? "99+" : unread}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}