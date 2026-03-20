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
  const [uploadPreview, setUploadPreview] = useState(null); // { name, type, size }
  const [error, setError] = useState("");

  const { selectedChat, setMessages, setChats } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

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

    try {
      const msg = await messageService.sendMessage(selectedChat._id, content);
      appendMessage(msg);
    } catch (err) {
      setText(content); // Restore on failure
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
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
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

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs"
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
            className="mb-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">
                {uploadPreview.type === "image" ? "📷" : "📎"} {uploadPreview.name}
              </span>
              <span className="text-xs text-primary-500 ml-2">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* File attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Attach file"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="
              input-field resize-none min-h-[40px] max-h-32 py-2.5 pr-10
              scrollbar-thin overflow-y-auto
            "
            style={{ lineHeight: "1.5" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={sending || !text.trim() || uploading}
          whileTap={{ scale: 0.9 }}
          className={`
            flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
            ${text.trim()
              ? "bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }
            disabled:opacity-60
          `}
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}