const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER — envoie email d'activation
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
const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", { ... });
console.log("Brevo status:", brevoRes.status);
const brevoData = await brevoRes.json();
console.log("Brevo response:", brevoData);
    // Générer le token d'activation
    const activationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      nom,
      email,
      password: hashed,
      photo,
      isActive: false, // ← compte inactif par défaut
      activationToken, // ← token d'activation
    });

    // Envoyer l'email d'activation via Brevo
    const activationUrl = `https://red-product-woad.vercel.app/activate.html?token=${activationToken}`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "RED PRODUCT", email: "baabou073@gmail.com" },
        to: [{ email }],
        subject: "Activez votre compte RED PRODUCT",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #494C4F;">RED PRODUCT</h2>
            <p>Bonjour <b>${nom}</b>,</p>
            <p>Merci de vous être inscrit ! Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
            <a href="${activationUrl}"
               style="display:inline-block; background:#494C4F; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin: 20px 0;">
              Activer mon compte
            </a>
            <p style="color:#999; font-size:12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
          </div>
        `,
      }),
    });

    res
      .status(201)
      .json({ message: "Compte créé ! Vérifiez votre email pour l'activer." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN — bloque si compte non activé
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable" });

    // ← Vérification activation
    if (user.isActive !== true) {
      return res
        .status(403)
        .json({ message: "Compte non activé. Vérifiez votre email." });
    }

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

// ACTIVATE ACCOUNT
exports.activateAccount = async (req, res) => {
  try {
    const user = await User.findOne({ activationToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Token invalide" });

    user.isActive = true;
    user.activationToken = undefined; // supprime le token
    await user.save();

    res.json({ message: "Compte activé avec succès" });
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

    const resetUrl = `https://red-product-woad.vercel.app/reset-password.html?token=${resetToken}`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "RED PRODUCT", email: "baabou073@gmail.com" },
        to: [{ email }],
        subject: "Réinitialisation de votre mot de passe",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #494C4F;">RED PRODUCT</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <a href="${resetUrl}" 
               style="display:inline-block; background:#494C4F; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin: 20px 0;">
              Réinitialiser mon mot de passe
            </a>
            <p style="color:#999; font-size:12px;">Ce lien expire dans 10 minutes.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Brevo error:", errData);
      return res.status(500).json({ message: "Erreur envoi email" });
    }

    res.json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur email:", error);
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
