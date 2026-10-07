const { geocodeLocation } = require("../services/geocodingService");

async function searchLocation(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "Please provide a valid location."
      });
    }

    const results = await geocodeLocation(q.trim());

    res.json({
      results
    });
  } catch (error) {
    console.error("Geocoding error:", error);

    res.status(500).json({
      message: "Unable to search location."
    });
  }
}

module.exports = {
  searchLocation
};