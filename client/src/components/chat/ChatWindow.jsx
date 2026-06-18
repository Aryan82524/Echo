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
    <div className="flex flex-col h-full bg-wa-bg dark:bg-wa-dark-bg">
      {/* Header — WhatsApp style */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-wa-header dark:bg-wa-dark-header border-b border-gray-200 dark:border-wa-dark-border z-10">
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-gray-500 transition-colors"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <Avatar
          name={chatName}
          src={chatAvatar}
          size="md"
          showOnline={!selectedChat.isGroupChat}
          isOnline={isOnline}
        />

        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-medium text-gray-900 dark:text-gray-100 truncate">
            {chatName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {typingInThisChat.length > 0
              ? <span className="text-primary-500 font-medium">
                  {typingInThisChat.length === 1
                    ? `${typingInThisChat[0].name} is typing…`
                    : `${typingInThisChat.length} people typing…`}
                </span>
              : selectedChat.isGroupChat
              ? `${selectedChat.participants?.length} participants`
              : isOnline
              ? "online"
              : otherUser?.lastSeen
              ? `last seen ${formatLastSeen(otherUser.lastSeen)}`
              : "offline"}
          </p>
        </div>

        {/* Search button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-gray-500 dark:text-gray-400 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>

        {/* More options */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-gray-500 dark:text-gray-400 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area — with WhatsApp wallpaper */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-[6%] lg:px-[10%] py-4 space-y-0.5 chat-wallpaper"
      >
        {/* Load more indicator */}
        {loadingMessages && pagination?.page > 1 && (
          <div className="flex justify-center py-3">
            <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No messages */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="px-5 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 shadow-sm">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                🔒 Messages are end-to-end encrypted. Say hello to {chatName}!
              </p>
            </div>
          </div>
        )}

        {/* Grouped Messages */}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider — WhatsApp style pill */}
            <div className="flex items-center justify-center my-4">
              <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium px-3 py-1.5 rounded-lg bg-white/80 dark:bg-wa-dark-incoming/80 shadow-sm backdrop-blur-sm">
                {new Date(date).toDateString() === new Date().toDateString()
                  ? "TODAY"
                  : new Date(date).toDateString() ===
                    new Date(Date.now() - 86400000).toDateString()
                  ? "YESTERDAY"
                  : new Date(date).toLocaleDateString([], {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
              </span>
            </div>

            {dateMessages.map((msg, idx) => {
              const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
              const prevMsg = idx > 0 ? dateMessages[idx - 1] : null;
              const showAvatar =
                !isOwn &&
                (!prevMsg ||
                  (prevMsg.sender?._id || prevMsg.sender) !==
                    (msg.sender?._id || msg.sender));
              
              // Show tail only if first message in a sequence from same sender
              const showTail = !prevMsg || 
                (prevMsg.sender?._id || prevMsg.sender) !== (msg.sender?._id || msg.sender);

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTail={showTail}
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