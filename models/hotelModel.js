const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  email: { type: String, default: "" },
  telephone: { type: String, default: "" },
  devise: { type: String, default: "cfa" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Hotel", hotelSchema);
