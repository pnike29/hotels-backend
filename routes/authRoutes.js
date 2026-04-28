const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary"); // ✅ Cloudinary
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  updatePhoto,
  countUsers,
} = require("../controllers/authController");


router.post("/register", upload.single("photo"), register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users", authMiddleware, getUsers);
router.get("/count", authMiddleware, countUsers);
router.put(
  "/update-photo",
  authMiddleware,
  upload.single("photo"),
  updatePhoto,
);


module.exports = router;
