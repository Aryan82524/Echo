import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${serverUrl}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("chatUser") || "null");
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("chatUser");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;