import { motion } from "framer-motion";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../shared/Avatar";
import {
  getChatName,
  getChatAvatar,
  getOtherUser,
  formatDate,
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
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <p className="text-3xl mb-2">🌐</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No chats yet. Search for someone to start talking!
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {chats.map((chat, i) => {
        const name = getChatName(chat, user._id);
        const avatar = getChatAvatar(chat, user._id);
        const otherUser = getOtherUser(chat, user._id);
        const isSelected = selectedChat?._id === chat._id;
        const unread = getUnreadCount(chat._id);
        const online = otherUser ? isUserOnline(otherUser._id) : false;

        const latestMsg = chat.latestMessage;
        let preview = "No messages yet";
        if (latestMsg) {
          if (latestMsg.type === "image") preview = "📷 Photo";
          else if (latestMsg.type === "file") preview = `📎 ${latestMsg.fileName || "File"}`;
          else preview = truncateText(latestMsg.content, 35);
        }

        return (
          <motion.button
            key={chat._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => {
              selectChat(chat);
              onChatSelect?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative ${
              isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
            }`}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
            )}

            <Avatar
              name={name}
              src={avatar}
              size="md"
              showOnline={!chat.isGroupChat}
              isOnline={online}
            />

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold truncate ${
                  isSelected
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}>
                  {name}
                  {chat.isGroupChat && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({chat.participants?.length})
                    </span>
                  )}
                </span>
                {latestMsg && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatDate(latestMsg.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-xs truncate ${
                  unread > 0
                    ? "text-gray-700 dark:text-gray-200 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {preview}
                </p>
                {unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-medium">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}