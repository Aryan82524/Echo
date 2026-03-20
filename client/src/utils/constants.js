export const SOCKET_EVENTS = {
  // Client -> Server
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",
  MESSAGE_SEND: "message:send",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  MESSAGES_READ: "messages:read",

  // Server -> Client
  MESSAGE_RECEIVED: "message:received",
  USERS_ONLINE: "users:online",
  MESSAGES_READ_ACK: "messages:read",
  ERROR: "error",
};

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
};

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE = 20 * 1024 * 1024;  // 20MB
export const TYPING_DEBOUNCE_MS = 1500;
export const MESSAGES_PER_PAGE = 30;