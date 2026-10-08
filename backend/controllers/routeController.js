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

    // Get routes from OSRM
    const routes =
      await getRoutes(
        start,
        destination
      );

    // Calculate safety information
    // for every route
    const formattedRoutes = [];

    for (
      let index = 0;
      index < routes.length;
      index++
    ) {
      const route = routes[index];

      const safetyData =
        calculateSafety(
          route,
          routes
        );

      formattedRoutes.push({
        id: index + 1,

        distance:
          route.distance,

        duration:
          route.duration,

        geometry:
          route.geometry,

        // Overall safety score
        safetyScore:
          safetyData.safetyScore,

        // Safety data coverage
        safetyConfidence:
          safetyData.confidence,

        // Individual safety factors
        safetyBreakdown:
          safetyData.factors,

        // Explanation for each factor
        safetyFactorDetails:
          safetyData.factorDetails,

        // Route characteristics
        routeContext:
          safetyData.routeContext,
      });
    }

    // Highest safety score first
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