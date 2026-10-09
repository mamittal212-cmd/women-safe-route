const {
  getRoutes,
} = require("../services/routingService");

const {
  calculateSafety,
} = require("../services/safetyService");

const {
  getGeographicContext,
  getCachedGeographicContext,
} = require("../services/safety/geographicContextService");


async function warmGeographicContext(
  routes
) {
  for (
    const route of routes
  ) {
    try {
      await getGeographicContext(
        route
      );
    } catch (error) {
      console.warn(
        "Background geographic enrichment failed:",
        error.message
      );
    }
  }
}


async function calculateRoutes(
  req,
  res
) {
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
      latitude:
        Number(startLat),

      longitude:
        Number(startLng),
    };


    const destination = {
      latitude:
        Number(destinationLat),

      longitude:
        Number(destinationLng),
    };


    if (
      Number.isNaN(
        start.latitude
      ) ||
      Number.isNaN(
        start.longitude
      ) ||
      Number.isNaN(
        destination.latitude
      ) ||
      Number.isNaN(
        destination.longitude
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid start or destination coordinates.",
      });
    }


    /*
     * Critical route calculation.
     *
     * This does NOT wait for Overpass.
     */
    const routes =
      await getRoutes(
        start,
        destination
      );


    const formattedRoutes =
      [];


    for (
      let index = 0;
      index < routes.length;
      index++
    ) {
      const route =
        routes[index];


      /*
       * Only read geographic data
       * from the existing cache.
       *
       * This operation never calls
       * Overpass.
       */
      const geographicContext =
        getCachedGeographicContext(
          route
        );


      const safetyData =
        calculateSafety(
          route,
          routes,
          geographicContext
        );


      formattedRoutes.push({
        id:
          index + 1,

        distance:
          route.distance,

        duration:
          route.duration,

        geometry:
          route.geometry,

        safetyScore:
          safetyData.safetyScore,

        safetyConfidence:
          safetyData.confidence,

        safetyBreakdown:
          safetyData.factors,

        safetyFactorDetails:
          safetyData.factorDetails,

       routeContext:
  safetyData.routeContext,

geographicContext:
  safetyData.geographicContext,

geographicDetails:
  safetyData.geographicDetails,
      });
    }


    /*
     * Safest routes first.
     */
    formattedRoutes.sort(
      (a, b) =>
        b.safetyScore -
        a.safetyScore
    );


    /*
     * Send the route response immediately.
     *
     * Geographic enrichment happens AFTER
     * the response and therefore cannot block
     * the critical route calculation.
     */
    res.json({
      routes:
        formattedRoutes,
    });


    /*
     * Background geographic enrichment.
     *
     * This runs sequentially rather than in
     * parallel to respect public Overpass
     * usage guidance.
     */
    setImmediate(() => {
      warmGeographicContext(
        routes
      ).catch(
        (error) => {
          console.warn(
            "Background geographic enrichment error:",
            error.message
          );
        }
      );
    });

  } catch (error) {
    console.error(
      "Routing error:",
      error
    );


    /*
     * Only send a response if one hasn't
     * already been sent.
     */
    if (!res.headersSent) {
      res.status(500).json({
        message:
          "Unable to calculate routes.",
      });
    }
  }
}


module.exports = {
  calculateRoutes,
};