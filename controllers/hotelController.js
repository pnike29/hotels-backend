const Hotel = require("../models/hotelModel");

// AJOUTER
exports.addHotel = async (req, res) => {
  try {
    console.log("req.file complet:", req.file); // 👈
    console.log("req.file:", req.file); // 👈 ajoute ça
    const { name, location, price, email, telephone, devise } = req.body;

    if (!name || !location || !price) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const hotel = await Hotel.create({
      name,
      location,
      price,
      email: email || "",
      telephone: telephone || "",
      devise: devise || "cfa",
      image: req.file ? req.file.path : "",
    });

    res.status(201).json({ message: "Hôtel ajouté avec succès", hotel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VOIR TOUS
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VOIR UN
exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hôtel introuvable" });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MODIFIER
exports.updateHotel = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path; // ✅ si nouvelle image uploadée

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!hotel) return res.status(404).json({ message: "Hôtel introuvable" });
    res.json({ message: "Hôtel modifié avec succès", hotel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUPPRIMER
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hôtel introuvable" });
    res.json({ message: "Hôtel supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// RECHERCHE
exports.searchHotels = async (req, res) => {
  try {
    const q = req.query.q || "";
    const hotels = await Hotel.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
