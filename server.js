require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");

const app = express();

const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(process.env.PORT, () =>
      console.log(`✅ Serveur lancé sur le port ${process.env.PORT}`),
    );
  })
  .catch((err) => console.error("❌ Erreur MongoDB:", err));
