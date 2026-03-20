// ─── Date Formatting ──────────────────────────────────────────────────────────
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

export const formatLastSeen = (date) => {
  if (!date) return "Online";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return formatDate(date);
};

// ─── File Helpers ─────────────────────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (fileName) => {
  if (!fileName) return "📎";
  const ext = fileName.split(".").pop().toLowerCase();
  const icons = {
    pdf: "📄",
    doc: "📝", docx: "📝",
    xls: "📊", xlsx: "📊",
    ppt: "📊", pptx: "📊",
    zip: "🗜️", rar: "🗜️",
    txt: "📃",
    mp4: "🎬", mov: "🎬",
    mp3: "🎵",
  };
  return icons[ext] || "📎";
};

// ─── Chat Helpers ─────────────────────────────────────────────────────────────
export const getChatName = (chat, currentUserId) => {
  if (chat.isGroupChat) return chat.name;
  const other = chat.participants.find(
    (p) => p._id.toString() !== currentUserId.toString()
  );
  return other?.name || "Unknown";
};

export const getChatAvatar = (chat, currentUserId) => {
  if (chat.isGroupChat) return chat.groupAvatar || null;
  const other = chat.participants.find(
    (p) => p._id.toString() !== currentUserId.toString()
  );
  return other?.avatar || null;
};

export const getOtherUser = (chat, currentUserId) => {
  if (chat.isGroupChat) return null;
  return chat.participants.find(
    (p) => p._id.toString() !== currentUserId.toString()
  );
};

// ─── String Helpers ───────────────────────────────────────────────────────────
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

export const truncateText = (text, maxLen = 40) => {
  if (!text || text.length <= maxLen) return text || "";
  return text.substring(0, maxLen) + "…";
};