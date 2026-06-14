const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { onRequest } = require("firebase-functions/v2/https");

const dotenv = require("dotenv");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const connectDB = require("./config/db");
const { initializeSocket } = require("./socket/socketHandler");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io instance to every request so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Initialize Socket Logic ──────────────────────────────────────────────────
initializeSocket(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_NAME) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`
    );
  });
}

exports.api = onRequest({ region: 'us-central1', memory: '1GiB', timeoutSeconds: 60 }, app);


