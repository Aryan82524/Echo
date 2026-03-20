import { motion } from "framer-motion";
import Avatar from "../shared/Avatar";
import { formatTime, formatFileSize, getFileIcon } from "../../utils/helpers";

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
};

export default function MessageBubble({ message, isOwn, showAvatar, isGroup }) {
  const senderName = message.sender?.name || "";
  const readCount = message.readBy?.length || 0;

  const ReadReceipt = () => {
    if (!isOwn) return null;
    return (
      <span className={`text-xs ml-1 ${readCount > 0 ? "text-blue-400" : "text-gray-400"}`}>
        {readCount > 0 ? "✓✓" : "✓"}
      </span>
    );
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-end gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar for group chats (other users only) */}
      <div className="w-7 flex-shrink-0">
        {!isOwn && isGroup && showAvatar ? (
          <Avatar name={senderName} src={message.sender?.avatar} size="xs" />
        ) : null}
      </div>

      {/* Bubble */}
      <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name for group */}
        {!isOwn && isGroup && showAvatar && (
          <span className="text-xs text-primary-500 font-medium mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Text message */}
        {message.type === "text" && (
          <div
            className={`
              px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed
              ${isOwn
                ? "bg-primary-500 text-white rounded-br-md"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-gray-700"
              }
            `}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}>
              <span className="text-xs">{formatTime(message.createdAt)}</span>
              <ReadReceipt />
            </div>
          </div>
        )}

        {/* Image message */}
        {message.type === "image" && (
          <div className={`rounded-2xl overflow-hidden shadow-sm ${isOwn ? "rounded-br-md" : "rounded-bl-md"}`}>
            <img
              src={message.fileUrl}
              alt="Attachment"
              className="max-w-[240px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
            <div className={`px-3 py-1.5 flex items-center justify-end gap-1 text-xs
              ${isOwn ? "bg-primary-500 text-white/70" : "bg-white dark:bg-gray-800 text-gray-400"}`}
            >
              <span>{formatTime(message.createdAt)}</span>
              <ReadReceipt />
            </div>
          </div>
        )}

        {/* File message */}
        {message.type === "file" && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm transition-opacity hover:opacity-80
              ${isOwn
                ? "bg-primary-500 text-white rounded-br-md"
                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-md"
              }
            `}
          >
            <span className="text-2xl">{getFileIcon(message.fileName)}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isOwn ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
                {message.fileName || "File"}
              </p>
              <p className={`text-xs ${isOwn ? "text-white/70" : "text-gray-400"}`}>
                {formatFileSize(message.fileSize)} • {formatTime(message.createdAt)}
              </p>
            </div>
            <ReadReceipt />
          </a>
        )}
      </div>
    </motion.div>
  );
}