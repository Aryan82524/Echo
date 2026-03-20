import api from "./api";

export const chatService = {
  accessChat: async (userId) => {
    const { data } = await api.post("/chats", { userId });
    return data;
  },

  getChats: async () => {
    const { data } = await api.get("/chats");
    return data;
  },

  createGroupChat: async (name, participants) => {
    const { data } = await api.post("/chats/group", { name, participants });
    return data;
  },

  renameGroup: async (chatId, name) => {
    const { data } = await api.put(`/chats/group/${chatId}/rename`, { name });
    return data;
  },

  addToGroup: async (chatId, userId) => {
    const { data } = await api.put(`/chats/group/${chatId}/add`, { userId });
    return data;
  },

  removeFromGroup: async (chatId, userId) => {
    const { data } = await api.put(`/chats/group/${chatId}/remove`, { userId });
    return data;
  },
};

export const messageService = {
  getMessages: async (chatId, page = 1) => {
    const { data } = await api.get(`/messages/${chatId}?page=${page}&limit=30`);
    return data;
  },

  sendMessage: async (chatId, content, type = "text", extras = {}) => {
    const { data } = await api.post("/messages", {
      chatId,
      content,
      type,
      ...extras,
    });
    return data;
  },

  searchMessages: async (chatId, query) => {
    const { data } = await api.get(`/messages/${chatId}/search?q=${query}`);
    return data;
  },

  markAsRead: async (chatId) => {
    const { data } = await api.put("/messages/read", { chatId });
    return data;
  },
};