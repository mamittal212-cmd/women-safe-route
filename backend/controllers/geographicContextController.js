const {
  getGeographicContext,
} = require("../services/safety/geographicContextService");

async function analyzeGeographicContext(
  req,
  res
) {
  try {
    const { geometry } = req.body;

    // Validate geometry object
    if (
      !geometry ||
      geometry.type !== "LineString" ||
      !Array.isArray(
        geometry.coordinates
      )
    ) {
      return res.status(400).json({
        message:
          "Valid LineString geometry is required.",
      });
    }

    // Validate coordinates
    const validCoordinates =
      geometry.coordinates.every(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          typeof coordinate[0] ===
            "number" &&
          typeof coordinate[1] ===
            "number"
      );

    if (!validCoordinates) {
      return res.status(400).json({
        message:
          "Geometry coordinates must be [longitude, latitude] pairs.",
      });
    }

    // Analyze geographic context
    const geographicContext =
      await getGeographicContext({
        geometry: {
          type: "LineString",
          coordinates:
            geometry.coordinates,
        },
      });

    res.json({
      geographicContext,
    });
  } catch (error) {
    console.error(
      "Geographic context controller error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to analyze geographic context.",
    });
  }
}

module.exports = {
  analyzeGeographicContext,
};