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


function buildGeographicSummary(
  geographicContext
) {
  if (!geographicContext) {
    return {
      available: false,
      status: "not_cached",
      source: "openstreetmap-overpass",
    };
  }

  return {
    available:
      geographicContext.available === true,

    status:
      geographicContext.status ||
      "unknown",

    source:
      geographicContext.source ||
      "openstreetmap-overpass",

    samplePoints:
      geographicContext.samplePoints ||
      0,

    searchRadius:
      geographicContext.searchRadius ||
      null,

    roadSummary:
      geographicContext.roadSummary || {
        totalRoads: 0,

        roadTypes: {
          major: 0,
          secondary: 0,
          local: 0,
          other: 0,
          unknown: 0,
        },

        highwayTypes: {},

        hasMajorRoads: false,
        hasSecondaryRoads: false,
        hasLocalRoads: false,
      },

    cache:
      geographicContext.cache || {
        hit: false,
      },
  };
}

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

  const factorResult =
    calculateRouteFactors(
      route,
      allRoutes,
      routeContext,
      geographicContext
    );

  const safetyResult =
    buildSafetyResult(
      factorResult.factors
    );

  return {
    ...safetyResult,

    routeContext,

    factorDetails:
      SAFETY_FACTORS,

    geographicDetails:
      factorResult.geographicDetails,

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
            status: "not_cached",
            source:
              "openstreetmap-overpass",
          },
  };
}

module.exports = {
  calculateSafety,
};