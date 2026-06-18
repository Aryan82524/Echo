import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import ThemeToggle from "../shared/ThemeToggle";
import Avatar from "../shared/Avatar";
import ChatList from "./ChatList";
import UserSearch from "./UserSearch";
import Modal from "../shared/Modal";
import { useChat } from "../../context/ChatContext";
import { chatService } from "../../services/chatService";
import { authService } from "../../services/authService";

export default function Sidebar({ onChatSelect }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const { notification } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const totalUnread = notification.length;

  return (
    <div className="flex flex-col h-full">
      {/* WhatsApp-style Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-wa-header dark:bg-wa-dark-header">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar name={user?.name} src={user?.avatar} size="md" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              {user?.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary-500" : "bg-gray-400"}`}
                animate={isConnected ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {isConnected ? "Online" : "Connecting…"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          
          {/* New chat button */}
          <motion.button
            onClick={() => setSearchOpen(true)}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,168,132,0.1)" }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 transition-colors"
            title="New Chat"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM11 5h2v4h4v2h-4v4h-2v-4H7V9h4V5z" />
            </svg>
          </motion.button>

          {/* Group chat button */}
          <motion.button
            onClick={() => setGroupModalOpen(true)}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,168,132,0.1)" }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 transition-colors"
            title="New Group"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </motion.button>

          {/* Menu / Logout */}
          <div className="relative">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,168,132,0.1)" }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </motion.button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-12 z-50 w-48 py-2 rounded-xl bg-white dark:bg-wa-dark-header shadow-2xl border border-gray-100 dark:border-wa-dark-border"
                >
                  <button
                    onClick={() => { logout(); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-wa-dark-hover flex items-center gap-3 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Log out
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-wa-sidebar dark:bg-wa-dark-sidebar">
        <motion.button
          onClick={() => setSearchOpen(true)}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-wa-dark-input text-gray-500 dark:text-gray-400 text-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-wa-dark-hover"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          Search or start new chat
        </motion.button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {totalUnread > 0 && (
          <div className="px-4 py-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
              {totalUnread} Unread
            </span>
          </div>
        )}
        <ChatList onChatSelect={onChatSelect} />
      </div>

      {/* Modals */}
      <UserSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onChatSelect={onChatSelect}
      />
      <CreateGroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onChatSelect={onChatSelect}
      />
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ isOpen, onClose, onChatSelect }) {
  const { selectChat, loadChats } = useChat();
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    try {
      const data = await authService.searchUsers(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUser = (u) => {
    setSelected((prev) =>
      prev.some((s) => s._id === u._id)
        ? prev.filter((s) => s._id !== u._id)
        : [...prev, u]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length < 2) return;
    setLoading(true);
    try {
      const chat = await chatService.createGroupChat(
        groupName,
        selected.map((u) => u._id)
      );
      await loadChats();
      selectChat(chat);
      onChatSelect?.();
      onClose();
      setGroupName("");
      setSelected([]);
      setSearch("");
      setResults([]);
    } catch (err) {
      console.error("Create group error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Group name…"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Search users to add…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="input-field"
        />

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((u) => (
              <motion.span
                key={u._id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => toggleUser(u)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium cursor-pointer hover:bg-primary-500/20 transition-colors"
              >
                {u.name}
                <span className="text-primary-300">✕</span>
              </motion.span>
            ))}
          </div>
        )}

        <div className="max-h-40 overflow-y-auto space-y-1">
          {results.map((u) => (
            <motion.button
              key={u._id}
              whileHover={{ backgroundColor: "rgba(0,168,132,0.05)" }}
              onClick={() => toggleUser(u)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                selected.some((s) => s._id === u._id)
                  ? "bg-primary-500/10"
                  : ""
              }`}
            >
              <Avatar name={u.name} src={u.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              {selected.some((s) => s._id === u._id) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selected.length < 2}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-3"
        >
          {loading ? "Creating…" : `Create Group (${selected.length} selected)`}
        </motion.button>

        {selected.length < 2 && (
          <p className="text-xs text-center text-gray-500">
            Select at least 2 users to create a group
          </p>
        )}
      </div>
    </Modal>
  );
}