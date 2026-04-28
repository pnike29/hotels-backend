const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, default: "" },
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = mongoose.model("User", userSchema);
