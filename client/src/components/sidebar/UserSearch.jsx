import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../shared/Modal";
import Avatar from "../shared/Avatar";
import { authService } from "../../services/authService";
import { chatService } from "../../services/chatService";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

export default function UserSearch({ isOpen, onClose, onChatSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(null);
  const { selectChat, loadChats } = useChat();
  const { isUserOnline } = useSocket();

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (!q.trim()) return setResults([]);
    setLoading(true);
    try {
      const data = await authService.searchUsers(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenChat = async (userId) => {
    setLoadingChat(userId);
    try {
      const chat = await chatService.accessChat(userId);
      await loadChats();
      await selectChat(chat);
      onChatSelect?.();
      onClose();
      setQuery("");
      setResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message">
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
            autoFocus
          />
        </div>

        <div className="min-h-[120px] max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No users found for "{query}"
            </div>
          )}

          {!loading && !query && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Type a name or email to search
            </div>
          )}

          <AnimatePresence>
            {results.map((u, i) => (
              <motion.button
                key={u._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpenChat(u._id)}
                disabled={loadingChat === u._id}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-60"
              >
                <Avatar
                  name={u.name}
                  src={u.avatar}
                  size="md"
                  showOnline
                  isOnline={isUserOnline(u._id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {loadingChat === u._id ? (
                  <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-gray-300 text-sm">→</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}