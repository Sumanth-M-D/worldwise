const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialize app and middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB using the URI from the .env file
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define the city schema
const citySchema = new mongoose.Schema({
  cityName: String,
  country: String,
  emoji: String,
  date: Date,
  notes: String,
  position: {
    lat: Number,
    lng: Number,
  },
});

const City = mongoose.model("City", citySchema);

// Function to map `_id` to `id`
function mapId(city) {
  return { ...city._doc, id: city._id };
}

// Get all cities
app.get("/cities", async (req, res) => {
  try {
    const cities = await City.find();
    const mappedCities = cities.map(mapId); // Map _id to id in each city
    res.json(mappedCities);
  } catch (err) {
    res.status(500).json({ error: "Error fetching cities" });
  }
});

// Get a single city by ID
app.get("/cities/:id", async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json(mapId(city)); // Map _id to id for a single city
  } catch (err) {
    res.status(500).json({ error: "Error fetching the city" });
  }
});

// Create a new city
app.post("/cities", async (req, res) => {
  const { cityName, country, emoji, date, notes, position } = req.body;
  const city = new City({ cityName, country, emoji, date, notes, position });

  try {
    await city.save();
    res.status(201).json(mapId(city)); // Map _id to id for the new city
  } catch (err) {
    res.status(500).json({ error: "Error creating the city" });
  }
});

// Delete a city by ID
app.delete("/cities/:id", async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.status(200).json({ message: "City deleted", city: mapId(city) }); // Map _id to id for deleted city
  } catch (err) {
    res.status(500).json({ error: "Error deleting the city" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
