import { useEffect, useRef, useCallback } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../shared/Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { getChatName, getChatAvatar, getOtherUser, formatLastSeen } from "../../utils/helpers";

export default function ChatWindow({ onBack }) {
  const { selectedChat, messages, loadingMessages, pagination, loadMessages, typingUsers } = useChat();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const chatName = getChatName(selectedChat, user._id);
  const chatAvatar = getChatAvatar(selectedChat, user._id);
  const otherUser = getOtherUser(selectedChat, user._id);
  const isOnline = otherUser ? isUserOnline(otherUser._id) : false;
  const typingInThisChat = typingUsers[selectedChat?._id] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingInThisChat]);

  // Load older messages when scrolling to top
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || loadingMessages || !pagination?.hasMore) return;
    if (el.scrollTop < 80) {
      loadMessages(selectedChat._id, pagination.page + 1);
    }
  }, [loadingMessages, pagination, selectedChat, loadMessages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className="md:hidden btn-ghost p-1.5 text-gray-500"
          aria-label="Back"
        >
          ←
        </button>

        <Avatar
          name={chatName}
          src={chatAvatar}
          size="md"
          showOnline={!selectedChat.isGroupChat}
          isOnline={isOnline}
        />

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {chatName}
          </h2>
          <p className="text-xs text-gray-400">
            {selectedChat.isGroupChat
              ? `${selectedChat.participants?.length} members`
              : isOnline
              ? "Online"
              : otherUser?.lastSeen
              ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
              : "Offline"}
          </p>
        </div>

        <button className="btn-ghost p-2 text-lg" title="Search messages">
          🔍
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20px 20px, rgba(99,102,241,0.03) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      >
        {/* Load more indicator */}
        {loadingMessages && pagination?.page > 1 && (
          <div className="flex justify-center py-2">
            <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No messages */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="text-5xl mb-3">👋</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Say hi to{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {chatName}
              </span>
              !
            </p>
          </div>
        )}

        {/* Grouped Messages */}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                {new Date(date).toDateString() === new Date().toDateString()
                  ? "Today"
                  : new Date(date).toDateString() ===
                    new Date(Date.now() - 86400000).toDateString()
                  ? "Yesterday"
                  : new Date(date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {dateMessages.map((msg, idx) => {
              const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
              const prevMsg = idx > 0 ? dateMessages[idx - 1] : null;
              const showAvatar =
                !isOwn &&
                (!prevMsg ||
                  (prevMsg.sender?._id || prevMsg.sender) !==
                    (msg.sender?._id || msg.sender));

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isGroup={selectedChat.isGroupChat}
                />
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingInThisChat.length > 0 && (
          <TypingIndicator names={typingInThisChat.map((u) => u.name)} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
}