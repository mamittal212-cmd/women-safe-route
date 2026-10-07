const { getRoutes } = require("../services/routingService");
const {
  calculateSafetyBreakdown,
} = require("../services/safetyService");

async function calculateRoutes(req, res) {
  try {
    const {
      startLat,
      startLng,
      destinationLat,
      destinationLng,
    } = req.query;

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

    const start = {
      latitude: Number(startLat),
      longitude: Number(startLng),
    };

    const destination = {
      latitude: Number(destinationLat),
      longitude: Number(destinationLng),
    };

    const routes = await getRoutes(start, destination);

    const formattedRoutes = routes.map((route, index) => {
      const safetyData = calculateSafetyBreakdown(
        route,
        routes
      );

      return {
        id: index + 1,
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        safetyScore: safetyData.safetyScore,
        safetyBreakdown: safetyData.safetyBreakdown,
      };
    });

    formattedRoutes.sort(
      (a, b) => b.safetyScore - a.safetyScore
    );

    res.json({
      routes: formattedRoutes,
    });
  } catch (error) {
    console.error("Routing error:", error);

    res.status(500).json({
      message: "Unable to calculate routes.",
    });
  }
}

module.exports = {
  calculateRoutes,
};