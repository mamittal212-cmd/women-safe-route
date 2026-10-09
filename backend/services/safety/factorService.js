const {
  calculateGeographicRoadSafety,
  calculateGeographicAccessibility,
  calculateGeographicEmergencyAccess,
} = require("./geographicFactorService");


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
 * Calculates a relative score by comparing
 * the current route with all available routes.
 */
function calculateRelativeScore(
  value,
  values,
  higherIsBetter = false
) {
  if (!values.length) {
    return 80;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) {
    return 80;
  }

  let normalized;

  if (higherIsBetter) {
    normalized =
      ((value - min) /
        (max - min)) *
      100;
  } else {
    normalized =
      100 -
      ((value - min) /
        (max - min)) *
        30;
  }

  return clampScore(normalized);
}


/*
 * Prototype baseline for Road Safety.
 *
 * This is NOT crime data or real-world
 * road-risk data.
 */
function calculateRoadSafety() {
  return 75;
}


/*
 * Prototype baseline for Accessibility.
 */
function calculateAccessibility() {
  return 75;
}


/*
 * Prototype baseline for Isolation.
 */
function calculateIsolation() {
  return 70;
}


/*
 * Prototype baseline for Emergency Access.
 */
function calculateEmergencyAccess() {
  return 75;
}


/*
 * Route Reliability is based on actual
 * routing information.
 */
function calculateReliability(
  routeContext
) {
  const distanceScore =
    1 -
    routeContext.relativeDistance;

  const durationScore =
    1 -
    routeContext.relativeDuration;

  const score =
    65 +
    distanceScore * 15 +
    durationScore * 20;

  return clampScore(score);
}


/*
 * Main safety-factor calculation.
 *
 * geographicContext is optional.
 */
function calculateRouteFactors(
  route,
  allRoutes,
  routeContext,
  geographicContext = null
) {
  const distances =
    allRoutes.map(
      (item) =>
        item.distance
    );

  const durations =
    allRoutes.map(
      (item) =>
        item.duration
    );


  /*
   * Route efficiency factors.
   */
  const routeLength =
    calculateRelativeScore(
      route.distance,
      distances
    );

  const routeTime =
    calculateRelativeScore(
      route.duration,
      durations
    );


  /*
   * Prototype baselines.
   */
  const roadSafetyBaseline =
    calculateRoadSafety();

  const accessibilityBaseline =
    calculateAccessibility();

  const emergencyAccessBaseline =
    calculateEmergencyAccess();


  /*
   * Geographic context can adjust
   * the prototype baselines.
   */
  const roadSafetyResult =
    calculateGeographicRoadSafety(
      roadSafetyBaseline,
      geographicContext
    );

  const accessibilityResult =
    calculateGeographicAccessibility(
      accessibilityBaseline,
      geographicContext
    );

  const emergencyAccessResult =
    calculateGeographicEmergencyAccess(
      emergencyAccessBaseline,
      geographicContext
    );


  const roadSafety =
    roadSafetyResult.score;

  const accessibility =
    accessibilityResult.score;

  const emergencyAccess =
    emergencyAccessResult.score;


  /*
   * Isolation remains a prototype baseline
   * until meaningful geographic/population
   * data is available.
   */
  const isolation =
    calculateIsolation();


  /*
   * Reliability uses actual route
   * comparison data.
   */
  const reliability =
    calculateReliability(
      routeContext
    );


  /*
   * IMPORTANT:
   * Return ONLY numeric safety factors here.
   *
   * Do NOT put geographicContext inside
   * this object because the scoring/frontend
   * expects every factor to be a number.
   */
return {
  factors: {
    roadSafety,
    accessibility,
    routeLength,
    routeTime,
    isolation,
    emergencyAccess,
    reliability,
  },

  geographicDetails: {
    roadSafety: roadSafetyResult.context,
    accessibility:
      accessibilityResult.context,
    emergencyAccess:
      emergencyAccessResult.context,
  },
};
}


module.exports = {
  calculateRouteFactors,
};