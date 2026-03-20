import api from "./api";

export const authService = {
  signup: async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await api.put("/auth/profile", updates);
    return data;
  },

  searchUsers: async (query) => {
    const { data } = await api.get(`/auth/users?search=${query}`);
    return data;
  },
};