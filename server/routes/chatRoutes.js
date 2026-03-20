const express = require("express");
const router = express.Router();
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, accessChat);
router.get("/", protect, getChats);
router.post("/group", protect, createGroupChat);
router.put("/group/:id/rename", protect, renameGroup);
router.put("/group/:id/add", protect, addToGroup);
router.put("/group/:id/remove", protect, removeFromGroup);

module.exports = router;