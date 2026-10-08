const {
  calculateRouteFactors,
} = require("./safety/factorService");

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
  const factors =
    calculateRouteFactors(
      route,
      allRoutes
    );

  const safetyResult =
    buildSafetyResult(factors);

  return {
    ...safetyResult,

    factorDetails:
      SAFETY_FACTORS,
  };
}

module.exports = {
  calculateSafety,
};