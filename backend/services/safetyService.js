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
  allRoutes
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
      routeContext
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
  };
}

module.exports = {
  calculateSafety,
}; 