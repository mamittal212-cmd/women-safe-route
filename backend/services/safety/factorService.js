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

  // All routes have the same value
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

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(normalized)
    )
  );
}


function calculateRouteFactors(
  route,
  allRoutes
) {
  const distances = allRoutes.map(
    (item) => item.distance
  );

  const durations = allRoutes.map(
    (item) => item.duration
  );

  /*
   * V2 FOUNDATION
   *
   * These baseline values are temporary.
   * They are intentionally separated from
   * the scoring engine so real data sources
   * can replace them later.
   */

  const roadSafety = 85;

  const accessibility = 80;

  const isolation = 75;

  const emergencyAccess = 80;

  const reliability = 85;

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

  return {
    roadSafety,
    accessibility,
    routeLength,
    routeTime,
    isolation,
    emergencyAccess,
    reliability,
  };
}


module.exports = {
  calculateRouteFactors,
};