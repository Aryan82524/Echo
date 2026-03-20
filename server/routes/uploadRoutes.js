const express = require("express");
const router = express.Router();
const {
  uploadImage,
  uploadFile,
  uploadAvatar,
  deleteFile,
} = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadImage: multerImage,
  uploadFile: multerFile,
  uploadAvatar: multerAvatar,
} = require("../middleware/uploadMiddleware");

router.post(
  "/image",
  protect,
  (req, res, next) => {
    multerImage.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  uploadImage
);

router.post(
  "/file",
  protect,
  (req, res, next) => {
    multerFile.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  uploadFile
);

router.post(
  "/avatar",
  protect,
  (req, res, next) => {
    multerAvatar.single("avatar")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  uploadAvatar
);

router.delete("/:publicId", protect, deleteFile);

module.exports = router;