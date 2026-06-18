import { motion } from "framer-motion";
import Avatar from "../shared/Avatar";
import { formatTime, formatFileSize, getFileIcon } from "../../utils/helpers";

const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

export default function MessageBubble({ message, isOwn, showAvatar, showTail, isGroup }) {
  const senderName = message.sender?.name || "";
  const readCount = message.readBy?.length || 0;

  // WhatsApp-style double check marks
  const ReadReceipt = () => {
    if (!isOwn) return null;
    return (
      <span className="ml-1 inline-flex items-center">
        {readCount > 0 ? (
          // Blue double check — read
          <svg viewBox="0 0 16 11" width="16" height="11" className="text-wa-blue-check">
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.327-.14.458.458 0 0 0-.33.136.505.505 0 0 0 .003.7l2.38 2.481c.087.09.2.142.32.147h.018a.41.41 0 0 0 .3-.13l6.548-8.09a.5.5 0 0 0-.026-.721z" fill="currentColor" />
            <path d="M14.757.653a.457.457 0 0 0-.305-.102.493.493 0 0 0-.38.178l-6.19 7.636-1.165-1.214.463-.572 .704.734c.087.09.2.142.32.147h.018a.41.41 0 0 0 .3-.13l6.548-8.09a.5.5 0 0 0-.026-.721z" fill="currentColor" opacity="0.9" />
          </svg>
        ) : (
          // Gray single check — sent
          <svg viewBox="0 0 12 11" width="12" height="11" className="text-gray-400">
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.327-.14.458.458 0 0 0-.33.136.505.505 0 0 0 .003.7l2.38 2.481c.087.09.2.142.32.147h.018a.41.41 0 0 0 .3-.13l6.548-8.09a.5.5 0 0 0-.026-.721z" fill="currentColor" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-end gap-1.5 mb-[3px] ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar for group chats */}
      <div className="w-7 flex-shrink-0">
        {!isOwn && isGroup && showAvatar ? (
          <Avatar name={senderName} src={message.sender?.avatar} size="xs" />
        ) : null}
      </div>

      {/* Bubble */}
      <div className={`max-w-[65%] sm:max-w-[55%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name for group */}
        {!isOwn && isGroup && showAvatar && (
          <span className="text-xs text-primary-500 font-semibold mb-0.5 px-3">
            {senderName}
          </span>
        )}

        {/* Text message */}
        {message.type === "text" && (
          <div
            className={`
              px-3 py-1.5 shadow-sm text-[14.5px] leading-[19px] relative
              ${isOwn
                ? showTail ? "bubble-outgoing" : "bg-wa-outgoing dark:bg-wa-dark-outgoing rounded-lg"
                : showTail ? "bubble-incoming" : "bg-wa-incoming dark:bg-wa-dark-incoming rounded-lg"
              }
            `}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            <span className={`flex items-center justify-end gap-0.5 mt-0.5 -mb-0.5 float-right ml-3 ${
              isOwn ? "text-gray-500 dark:text-gray-400" : "text-wa-time dark:text-gray-400"
            }`}>
              <span className="text-[11px]">{formatTime(message.createdAt)}</span>
              <ReadReceipt />
            </span>
            {/* Invisible spacer for the time */}
            <span className="invisible text-[11px] ml-3">{formatTime(message.createdAt)} ✓✓</span>
          </div>
        )}

        {/* Image message */}
        {message.type === "image" && (
          <div className={`rounded-lg overflow-hidden shadow-sm ${
            isOwn
              ? showTail ? "bubble-outgoing p-1" : "bg-wa-outgoing dark:bg-wa-dark-outgoing p-1 rounded-lg"
              : showTail ? "bubble-incoming p-1" : "bg-wa-incoming dark:bg-wa-dark-incoming p-1 rounded-lg"
          }`}>
            <img
              src={message.fileUrl}
              alt="Attachment"
              className="max-w-[280px] max-h-[320px] object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-md"
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
            <div className="px-2 py-1 flex items-center justify-end gap-1">
              <span className="text-[11px] text-wa-time dark:text-gray-400">{formatTime(message.createdAt)}</span>
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
              flex items-center gap-3 px-3 py-2.5 shadow-sm transition-opacity hover:opacity-90
              ${isOwn
                ? showTail ? "bubble-outgoing" : "bg-wa-outgoing dark:bg-wa-dark-outgoing rounded-lg"
                : showTail ? "bubble-incoming" : "bg-wa-incoming dark:bg-wa-dark-incoming rounded-lg"
              }
            `}
          >
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{getFileIcon(message.fileName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.fileName || "File"}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-wa-time dark:text-gray-400">
                  {formatFileSize(message.fileSize)} • {formatTime(message.createdAt)}
                </span>
                <ReadReceipt />
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400 flex-shrink-0">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
}