const {
  calculateRouteFactors,
} = require("./safety/factorService");

const {
  calculateRouteContext,
} = require("./safety/routeContextService");

const {
  buildSafetyResult,
} = require("./safety/scoringService");

const {
  SAFETY_FACTORS,
} = require("./safety/safetyConfig");


function calculateSafety(
  route,
  allRoutes,
  geographicContext = null
) {
  const routeContext =
    calculateRouteContext(
      route,
      allRoutes
    );


  const factors =
    calculateRouteFactors(
      route,
      allRoutes,
      routeContext,
      geographicContext
    );


  const safetyResult =
    buildSafetyResult(
      factors
    );


  return {
    ...safetyResult,

    routeContext,

    factorDetails:
      SAFETY_FACTORS,

    geographicContext:
      geographicContext
        ? {
            available:
              geographicContext.available,

            status:
              geographicContext.status,

            source:
              geographicContext.source,

            samplePoints:
              geographicContext.samplePoints,

            roadSummary:
              geographicContext.roadSummary,

            cache:
              geographicContext.cache,
          }
        : {
            available: false,
            status:
              "not_cached",
            source:
              "openstreetmap-overpass",
          },
  };
}


module.exports = {
  calculateSafety,
};