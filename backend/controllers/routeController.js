const { getRoutes } = require("../services/routingService");

const {
  calculateSafety,
} = require("../services/safetyService");

async function calculateRoutes(req, res) {
  try {
    const {
      startLat,
      startLng,
      destinationLat,
      destinationLng,
    } = req.query;

    // Validate coordinates
    if (
      !startLat ||
      !startLng ||
      !destinationLat ||
      !destinationLng
    ) {
      return res.status(400).json({
        message:
          "Start and destination coordinates are required.",
      });
    }

    // Convert coordinates to numbers
    const start = {
      latitude: Number(startLat),
      longitude: Number(startLng),
    };

    const destination = {
      latitude: Number(destinationLat),
      longitude: Number(destinationLng),
    };

    // Validate converted coordinates
    if (
      Number.isNaN(start.latitude) ||
      Number.isNaN(start.longitude) ||
      Number.isNaN(destination.latitude) ||
      Number.isNaN(destination.longitude)
    ) {
      return res.status(400).json({
        message:
          "Invalid start or destination coordinates.",
      });
    }

    // Get routes from routing service
    const routes = await getRoutes(
      start,
      destination
    );

    // Calculate safety information
    // for every route
    const formattedRoutes = routes.map(
      (route, index) => {
        const safetyData =
          calculateSafety(
            route,
            routes
          );

        return {
          id: index + 1,

          distance: route.distance,

          duration: route.duration,

          geometry: route.geometry,

          // Overall safety score
          safetyScore:
            safetyData.safetyScore,

          // Percentage of safety data
          // currently backed by real data
          safetyConfidence:
            safetyData.confidence,

          // Individual safety factor scores
          safetyBreakdown:
            safetyData.factors,

          // Explanation/details for
          // every safety factor
          safetyFactorDetails:
            safetyData.factorDetails,
        };
      }
    );

    // Sort routes by safety score
    // Highest score first
    formattedRoutes.sort(
      (a, b) =>
        b.safetyScore -
        a.safetyScore
    );

    res.json({
      routes: formattedRoutes,
    });
  } catch (error) {
    console.error(
      "Routing error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to calculate routes.",
    });
  }
}

module.exports = {
  calculateRoutes,
};