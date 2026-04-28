const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
console.log("Cloudinary cloud_name:", process.env.CLOUD_NAME);
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hotels",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
console.log("CloudinaryStorage créé:", !!storage); // 👈
const upload = multer({ storage });
console.log("upload multer créé:", typeof upload.single); // 👈

module.exports = { cloudinary, upload };
