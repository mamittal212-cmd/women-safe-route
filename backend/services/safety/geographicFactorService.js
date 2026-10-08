function clampScore(score) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
}


/*
 * Converts road distribution into a
 * small contextual adjustment.
 *
 * This is geographic context, NOT crime data.
 */
function calculateRoadContextAdjustment(
  geographicContext
) {
  if (
    !geographicContext ||
    !geographicContext.available
  ) {
    return {
      available: false,
      adjustment: 0,
    };
  }

  const {
    roadTypes,
  } =
    geographicContext.roadSummary || {};

  if (!roadTypes) {
    return {
      available: false,
      adjustment: 0,
    };
  }

  const total =
    Object.values(roadTypes)
      .reduce(
        (sum, value) =>
          sum + value,
        0
      );

  if (total === 0) {
    return {
      available: false,
      adjustment: 0,
    };
  }

  const majorRatio =
    roadTypes.major / total;

  const secondaryRatio =
    roadTypes.secondary / total;

  const localRatio =
    roadTypes.local / total;


  /*
   * Positive adjustment indicates stronger
   * road connectivity characteristics.
   *
   * Keep the adjustment deliberately small.
   */
  const adjustment =
    majorRatio * 6 +
    secondaryRatio * 3 -
    localRatio * 2;

  return {
    available: true,
    adjustment:
      Number(
        adjustment.toFixed(2)
      ),
    roadRatios: {
      major:
        Number(
          majorRatio.toFixed(3)
        ),
      secondary:
        Number(
          secondaryRatio.toFixed(3)
        ),
      local:
        Number(
          localRatio.toFixed(3)
        ),
    },
  };
}


/*
 * Road Safety
 *
 * Uses a modest geographic adjustment
 * around the prototype baseline.
 */
function calculateGeographicRoadSafety(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  return {
    score: clampScore(
      baseline +
        context.adjustment
    ),
    context,
  };
}


/*
 * Accessibility
 */
function calculateGeographicAccessibility(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  return {
    score: clampScore(
      baseline +
        context.adjustment
    ),
    context,
  };
}


/*
 * Emergency access receives a slightly
 * stronger geographic influence because
 * road connectivity can affect access.
 */
function calculateGeographicEmergencyAccess(
  baseline,
  geographicContext
) {
  const context =
    calculateRoadContextAdjustment(
      geographicContext
    );

  return {
    score: clampScore(
      baseline +
        context.adjustment *
          1.5
    ),
    context,
  };
}


module.exports = {
  calculateRoadContextAdjustment,
  calculateGeographicRoadSafety,
  calculateGeographicAccessibility,
  calculateGeographicEmergencyAccess,
};