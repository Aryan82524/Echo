import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { messageService } from "../../services/chatService";
import { uploadService } from "../../services/uploadService";
import {
  TYPING_DEBOUNCE_MS,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
} from "../../utils/constants";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [error, setError] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const { selectedChat, setMessages } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, [selectedChat]);

  // ─── Typing Indicators ──────────────────────────────────────────────────────
  const sendTypingStart = useCallback(() => {
    if (!isTypingRef.current && socket && selectedChat) {
      socket.emit("typing:start", { chatId: selectedChat._id });
      isTypingRef.current = true;
    }
  }, [socket, selectedChat]);

  const sendTypingStop = useCallback(() => {
    if (isTypingRef.current && socket && selectedChat) {
      socket.emit("typing:stop", { chatId: selectedChat._id });
      isTypingRef.current = false;
    }
  }, [socket, selectedChat]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    sendTypingStart();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(sendTypingStop, TYPING_DEBOUNCE_MS);
  };

  // Stop typing on unmount or chat change
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      sendTypingStop();
    };
  }, [selectedChat, sendTypingStop]);

  // ─── Append message to local state instantly ─────────────────────────────────
  const appendMessage = (msg) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === msg._id);
      return exists ? prev : [...prev, msg];
    });
  };

  // ─── Send Text Message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim();
    if (!content || !selectedChat || sending) return;

    setSending(true);
    setText("");
    sendTypingStop();
    clearTimeout(typingTimeoutRef.current);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const msg = await messageService.sendMessage(selectedChat._id, content);
      appendMessage(msg);
    } catch (err) {
      setText(content);
      setError("Failed to send message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── File Selection ───────────────────────────────────────────────────────────
  const handleFileSelect = async (e, forceType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachMenu(false);

    const isImage = forceType === "image" || ALLOWED_IMAGE_TYPES.includes(file.type);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

    if (file.size > maxSize) {
      setError(`File too large. Max size: ${isImage ? "5MB" : "20MB"}`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploadPreview({ name: file.name, type: isImage ? "image" : "file", size: file.size });
    setUploading(true);
    setUploadProgress(0);

    try {
      let result;
      if (isImage) {
        result = await uploadService.uploadImage(file, setUploadProgress);
      } else {
        result = await uploadService.uploadFile(file, setUploadProgress);
      }

      const msg = await messageService.sendMessage(
        selectedChat._id,
        file.name,
        isImage ? "image" : "file",
        {
          fileUrl: result.url,
          fileName: result.originalName || file.name,
          fileSize: file.size,
        }
      );
      appendMessage(msg);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploading(false);
      setUploadPreview(null);
      setUploadProgress(0);
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="bg-wa-header dark:bg-wa-dark-header px-3 py-2.5 border-t border-gray-200 dark:border-wa-dark-border">
      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && uploadPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 px-3 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-primary-400 font-medium truncate">
                {uploadPreview.type === "image" ? "📷" : "📄"} {uploadPreview.name}
              </span>
              <span className="text-xs text-primary-500 ml-2 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-primary-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #00A884, #25D366)" }}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Emoji placeholder */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-wa-dark-hover transition-colors"
          title="Emoji"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </motion.button>

        {/* Attach button with menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 45 }}
            disabled={uploading}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-wa-dark-hover transition-all disabled:opacity-50"
            title="Attach file"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
            </svg>
          </motion.button>

          {/* Attach menu popup */}
          <AnimatePresence>
            {showAttachMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute bottom-14 left-0 z-50 flex flex-col gap-3 p-3"
                >
                  {[
                    { icon: "📷", label: "Photo", color: "from-purple-500 to-pink-500", onClick: () => imageInputRef.current?.click() },
                    { icon: "📄", label: "Document", color: "from-blue-500 to-indigo-500", onClick: () => fileInputRef.current?.click() },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { item.onClick(); }}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-white bg-wa-dark-header px-3 py-1.5 rounded-lg shadow-lg">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, "image")}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip"
          onChange={(e) => handleFileSelect(e, "file")}
          className="hidden"
        />

        {/* Text area — WhatsApp style */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            className="w-full resize-none min-h-[42px] max-h-[120px] py-2.5 px-4 rounded-lg
                       bg-white dark:bg-wa-dark-input
                       border border-gray-200 dark:border-transparent
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none
                       transition-all duration-200 text-[15px]"
            style={{ lineHeight: "1.4" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
        </div>

        {/* Send / Voice button */}
        <motion.button
          onClick={handleSend}
          disabled={sending || uploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
            hasText
              ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25"
              : "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25"
          }`}
        >
          {sending ? (
            <motion.span
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : hasText ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}