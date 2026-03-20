const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  searchMessages,
  markAsRead,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages);
router.get("/:chatId/search", protect, searchMessages);
router.put("/read", protect, markAsRead);

module.exports = router;