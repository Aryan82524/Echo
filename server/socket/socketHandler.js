const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// In-memory map of online users: userId -> socketId
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // ─── Socket Auth Middleware ─────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    const userName = socket.user.name;

    console.log(`🟢 Connected: ${userName} [${socket.id}]`);

    // ─── Mark User Online ───────────────────────────────────────────────────
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: null,
    });

    // Broadcast updated online list
    io.emit("users:online", Array.from(onlineUsers.keys()));

    // ─── Join Personal Room ─────────────────────────────────────────────────
    // Used for direct notifications to a specific user
    socket.join(userId);

    // ─── Join All User's Chat Rooms on Connect ──────────────────────────────
    try {
      const chats = await Chat.find({ participants: { $in: [userId] } }).select("_id");
      chats.forEach((chat) => socket.join(chat._id.toString()));
    } catch (err) {
      console.error("Error joining chat rooms:", err.message);
    }

    // ─── Join Specific Chat Room ────────────────────────────────────────────
    socket.on("chat:join", async (chatId) => {
      // Verify user is a participant before joining
      const chat = await Chat.findOne({
        _id: chatId,
        participants: { $in: [userId] },
      });

      if (chat) {
        socket.join(chatId);
        console.log(`${userName} joined chat: ${chatId}`);
      } else {
        socket.emit("error", { message: "Not authorized to join this chat" });
      }
    });

    socket.on("chat:leave", (chatId) => {
      socket.leave(chatId);
      console.log(`${userName} left chat: ${chatId}`);
    });

    // ─── Send Message via Socket ────────────────────────────────────────────
    // Alternative to REST API — used for instant delivery
    socket.on("message:send", async (data) => {
      const { chatId, content, type = "text", fileUrl, fileName, fileSize } = data;

      try {
        // Verify chat membership
        const chat = await Chat.findOne({
          _id: chatId,
          participants: { $in: [userId] },
        });

        if (!chat) {
          return socket.emit("error", { message: "Not authorized for this chat" });
        }

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content: content || "",
          type,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        const populated = await message.populate([
          { path: "sender", select: "name avatar email" },
          {
            path: "chat",
            populate: { path: "participants", select: "name avatar email" },
          },
        ]);

        // Emit to all members of the chat room
        io.to(chatId).emit("message:received", populated);
      } catch (err) {
        console.error("message:send error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ─── Typing Indicators ──────────────────────────────────────────────────
    socket.on("typing:start", ({ chatId }) => {
      // Emit to everyone in the chat EXCEPT the sender
      socket.to(chatId).emit("typing:start", {
        userId,
        name: userName,
        chatId,
      });
    });

    socket.on("typing:stop", ({ chatId }) => {
      socket.to(chatId).emit("typing:stop", {
        userId,
        chatId,
      });
    });

    // ─── Read Receipts ──────────────────────────────────────────────────────
    socket.on("messages:read", async ({ chatId }) => {
      try {
        await Message.updateMany(
          {
            chat: chatId,
            sender: { $ne: userId },
            "readBy.user": { $ne: userId },
          },
          {
            $push: { readBy: { user: userId, readAt: new Date() } },
          }
        );

        socket.to(chatId).emit("messages:read", { chatId, userId });
      } catch (err) {
        console.error("messages:read error:", err.message);
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on("disconnect", async (reason) => {
      console.log(`🔴 Disconnected: ${userName} [reason: ${reason}]`);

      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("users:online", Array.from(onlineUsers.keys()));
    });

    // ─── Error Handling ─────────────────────────────────────────────────────
    socket.on("error", (err) => {
      console.error(`Socket error from ${userName}:`, err.message);
    });
  });
};

module.exports = { initializeSocket };