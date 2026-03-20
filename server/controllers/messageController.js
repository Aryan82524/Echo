const Message = require("../models/Message");
const Chat = require("../models/Chat");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, type = "text", fileUrl, fileName, fileSize } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }
    if (type === "text" && (!content || content.trim() === "")) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    // Verify user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    });

    if (!chat) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content || "",
      type,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
    });

    // Update chat's latestMessage
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Populate sender info
    const populated = await message.populate([
      { path: "sender", select: "name avatar email" },
      { path: "chat", populate: { path: "participants", select: "name avatar email" } },
    ]);

    // Emit via socket to all chat participants in real-time
    if (req.io) {
      req.io.to(chatId).emit("message:received", populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a chat (paginated)
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Verify access
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    });

    if (!chat) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const [messages, total] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name avatar email")
        .lean(),
      Message.countDocuments({ chat: chatId }),
    ]);

    res.status(200).json({
      messages: messages.reverse(), // Return chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search messages within a chat
// @route   GET /api/messages/:chatId/search?q=query
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      chat: chatId,
      content: { $regex: q, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "name avatar email");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        "readBy.user": { $ne: req.user._id },
      },
      {
        $push: { readBy: { user: req.user._id, readAt: new Date() } },
      }
    );

    if (req.io) {
      req.io.to(chatId).emit("messages:read", {
        chatId,
        userId: req.user._id,
      });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, searchMessages, markAsRead };