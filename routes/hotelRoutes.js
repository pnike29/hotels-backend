const express = require("express");
const router = express.Router();
const {
  addHotel,
  getHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  searchHotels,
} = require("../controllers/hotelController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary"); // ✅ Cloudinary

router.get("/", getHotels);
router.get("/search", searchHotels);
router.get("/:id", getHotel);
router.post("/", authMiddleware, upload.single("image"), addHotel);
router.put("/:id", authMiddleware, upload.single("image"), updateHotel);
router.delete("/:id", authMiddleware, deleteHotel);

module.exports = router;
