function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateRoadContextAdjustment(geographicContext) {
  if (
    !geographicContext ||
    geographicContext.available !== true
  ) {
    return {
      available: false,
      adjustment: 0,
      reason: "Geographic context unavailable.",
    };
  }

  const roadTypes =
    geographicContext.roadSummary?.roadTypes;

  if (!roadTypes) {
    return {
      available: false,
      adjustment: 0,
      reason: "Road classification data unavailable.",
    };
  }

  const total = Object.values(roadTypes).reduce(
    (sum, value) => sum + value,
    0
  );

  if (total === 0) {
    return {
      available: false,
      adjustment: 0,
      reason: "No classified roads found.",
    };
  }

  const majorRatio = roadTypes.major / total;
  const secondaryRatio = roadTypes.secondary / total;
  const localRatio = roadTypes.local / total;

  const adjustment =
    majorRatio * 6 +
    secondaryRatio * 3 -
    localRatio * 2;

  return {
    available: true,

    adjustment: Number(
      adjustment.toFixed(2)
    ),

    roadRatios: {
      major: Number(majorRatio.toFixed(3)),
      secondary: Number(secondaryRatio.toFixed(3)),
      local: Number(localRatio.toFixed(3)),
    },

    roadCounts: {
      major: roadTypes.major,
      secondary: roadTypes.secondary,
      local: roadTypes.local,
      other: roadTypes.other,
      unknown: roadTypes.unknown,
    },

    source:
      geographicContext.source ||
      "openstreetmap-overpass",
  };
}


function calculateGeographicRoadSafety(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  const score = clampScore(
    baseline + context.adjustment
  );

  return {
    score,
    context: {
      ...context,
      baseline,
      finalScore: score,
    },
  };
}


function calculateGeographicAccessibility(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  const score = clampScore(
    baseline + context.adjustment
  );

  return {
    score,
    context: {
      ...context,
      baseline,
      finalScore: score,
    },
  };
}


function calculateGeographicEmergencyAccess(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  const emergencyAdjustment =
    context.adjustment * 1.5;

  const score = clampScore(
    baseline + emergencyAdjustment
  );

  return {
    score,
    context: {
      ...context,
      adjustment: Number(
        emergencyAdjustment.toFixed(2)
      ),
      baseline,
      finalScore: score,
    },
  };
}


module.exports = {
  calculateRoadContextAdjustment,
  calculateGeographicRoadSafety,
  calculateGeographicAccessibility,
  calculateGeographicEmergencyAccess,
};