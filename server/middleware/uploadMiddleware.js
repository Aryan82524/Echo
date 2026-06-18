
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern-chat/images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// File storage
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern-chat/files",
    resource_type: "raw",
  },
});

// Image upload
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// File upload
const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern-chat/avatars",
    transformation: [{ width: 200, height: 200, crop: "fill" }],
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { uploadImage, uploadFile, uploadAvatar };