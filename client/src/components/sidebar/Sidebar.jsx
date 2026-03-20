import { useState } from "react";
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

  const totalUnread = notification.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {user?.name}
            </p>
            <p className="text-xs flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-gray-400"
                }`}
              />
              <span className="text-gray-400">
                {isConnected ? "Online" : "Connecting…"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-ghost p-2 text-lg"
            title="New Chat"
          >
            ✏️
          </button>
          <button
            onClick={() => setGroupModalOpen(true)}
            className="btn-ghost p-2 text-lg"
            title="New Group"
          >
            👥
          </button>
          <button
            onClick={logout}
            className="btn-ghost p-2 text-lg"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          🔍 Search people…
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {totalUnread > 0 && (
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
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
              <span
                key={u._id}
                onClick={() => toggleUser(u)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs cursor-pointer hover:opacity-80 transition-opacity"
              >
                {u.name} ✕
              </span>
            ))}
          </div>
        )}

        <div className="max-h-40 overflow-y-auto space-y-1">
          {results.map((u) => (
            <button
              key={u._id}
              onClick={() => toggleUser(u)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                selected.some((s) => s._id === u._id)
                  ? "bg-primary-50 dark:bg-primary-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Avatar name={u.name} src={u.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              {selected.some((s) => s._id === u._id) && (
                <span className="text-primary-500 flex-shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selected.length < 2}
          className="btn-primary w-full"
        >
          {loading ? "Creating…" : `Create Group (${selected.length} selected)`}
        </button>

        {selected.length < 2 && (
          <p className="text-xs text-center text-gray-400">
            Select at least 2 users to create a group
          </p>
        )}
      </div>
    </Modal>
  );
}