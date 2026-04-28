const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password)
      return res.status(400).json({ message: "Tous les champs sont requis" });
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });
    const hashed = await bcrypt.hash(password, 10);
    const photo = req.file ? req.file.path : "";
    const user = await User.create({ nom, email, password: hashed, photo });
    res
      .status(201)
      .json({
        message: "Compte créé avec succès",
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          photo: user.photo,
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });
    const token = jwt.sign(
      { id: user._id, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable" });
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.json({ message: "Token de réinitialisation généré", resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Token invalide ou expiré" });
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const hotels = await Hotel.find(); // pas de limite ici
    const users = await User.find()
      .select("-password")
      .sort({ _id: -1 })
      .limit(5);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePhoto = async (req, res) => {
  try {
    const photo = req.file ? req.file.path : null;
    if (!photo)
      return res.status(400).json({ message: "Aucune photo fournie" });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo },
      { new: true },
    );
    res.json({ photo: user.photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
