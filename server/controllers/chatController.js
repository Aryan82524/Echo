const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

// @desc    Create or fetch 1-on-1 chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Check if chat already exists between the two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId] },
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name avatar email" },
      });

    if (chat) {
      return res.status(200).json(chat);
    }

    // Create new chat
    const newChat = await Chat.create({
      isGroupChat: false,
      participants: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chats for logged-in user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name avatar email" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants) {
      return res.status(400).json({ message: "Group name and participants are required" });
    }

    let parsedParticipants =
      typeof participants === "string" ? JSON.parse(participants) : participants;

    if (parsedParticipants.length < 2) {
      return res.status(400).json({ message: "Group chat needs at least 2 other participants" });
    }

    // Add the creator to the group
    parsedParticipants.push(req.user._id.toString());

    // Remove duplicates
    const uniqueParticipants = [...new Set(parsedParticipants)];

    const groupChat = await Chat.create({
      name,
      isGroupChat: true,
      participants: uniqueParticipants,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/group/:id/rename
// @access  Private
const renameGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "Not a group chat" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only group admin can rename the group" });
    }

    chat.name = name;
    const updated = await chat.save();
    const populated = await updated.populate([
      { path: "participants", select: "-password" },
      { path: "groupAdmin", select: "-password" },
    ]);

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add participant to group
// @route   PUT /api/chats/group/:id/add
// @access  Private
const addToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }
    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    chat.participants.push(userId);
    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove participant from group
// @route   PUT /api/chats/group/:id/remove
// @access  Private
const removeFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== userId
    );
    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};