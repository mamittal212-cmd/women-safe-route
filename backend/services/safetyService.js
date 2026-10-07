const WEIGHTS = {
  roadSafety: 0.20,
  accessibility: 0.15,
  routeLength: 0.10,
  routeTime: 0.10,
  isolation: 0.15,
  emergencyAccess: 0.15,
  reliability: 0.15,
};

function calculateSafetyBreakdown(route, allRoutes) {
  /*
   * SafeRoute V1 Prototype Safety Model
   *
   * These values are baseline prototype values.
   * They are NOT real-world crime or safety data.
   *
   * V2 will replace these with actual safety datasets.
   */

  const roadSafety = 85;
  const accessibility = 80;
  const isolation = 75;
  const emergencyAccess = 80;
  const reliability = 85;

  // Route length score
  const distances = allRoutes.map((item) => item.distance);

  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  let routeLength = 80;

  if (maxDistance !== minDistance) {
    routeLength =
      100 -
      ((route.distance - minDistance) /
        (maxDistance - minDistance)) *
        30;
  }

  // Route time score
  const durations = allRoutes.map((item) => item.duration);

  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  let routeTime = 80;

  if (maxDuration !== minDuration) {
    routeTime =
      100 -
      ((route.duration - minDuration) /
        (maxDuration - minDuration)) *
        30;
  }

  const breakdown = {
    roadSafety: Math.round(roadSafety),
    accessibility: Math.round(accessibility),
    routeLength: Math.round(routeLength),
    routeTime: Math.round(routeTime),
    isolation: Math.round(isolation),
    emergencyAccess: Math.round(emergencyAccess),
    reliability: Math.round(reliability),
  };

  const score =
    breakdown.roadSafety * WEIGHTS.roadSafety +
    breakdown.accessibility * WEIGHTS.accessibility +
    breakdown.routeLength * WEIGHTS.routeLength +
    breakdown.routeTime * WEIGHTS.routeTime +
    breakdown.isolation * WEIGHTS.isolation +
    breakdown.emergencyAccess * WEIGHTS.emergencyAccess +
    breakdown.reliability * WEIGHTS.reliability;

  return {
    safetyScore: Math.round(score),
    safetyBreakdown: breakdown,
  };
}

module.exports = {
  calculateSafetyBreakdown,
};