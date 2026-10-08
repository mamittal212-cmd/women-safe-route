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
  allRoutes,
  routeContext
) {
  const distances = allRoutes.map(
    (item) => item.distance
  );

  const durations = allRoutes.map(
    (item) => item.duration
  );

  /*
   * V2 ROUTE-DEPENDENT FACTORS
   *
   * These factors are based only on
   * observable routing characteristics.
   *
   * No crime or real-world safety claims
   * are being made at this stage.
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
   * Accessibility
   *
   * Temporary route-dependent estimate.
   *
   * Routes closer to the fastest route
   * receive a slightly higher accessibility
   * score because they generally represent
   * more direct routing.
   */

  const accessibility = Math.round(
    70 +
      (1 -
        routeContext.relativeDistance) *
        20
  );

  /*
   * Reliability
   *
   * Routes with shorter travel times
   * receive a slightly higher baseline
   * reliability score.
   */

  const reliability = Math.round(
    70 +
      (1 -
        routeContext.relativeDuration) *
        20
  );

  /*
   * Road Safety
   *
   * No real road-safety dataset is connected
   * yet. Keep this conservative and clearly
   * separate from future geographic data.
   */

  const roadSafety = Math.round(
    75 +
      (1 -
        routeContext.relativeDistance) *
        10
  );

  /*
   * Isolation
   *
   * We currently don't have population,
   * pedestrian, lighting, or land-use data.
   *
   * Therefore this remains a baseline value.
   */

  const isolation = 75;

  /*
   * Emergency Access
   *
   * Real emergency-facility data will be
   * connected in a later V2 stage.
   */

  const emergencyAccess = 80;

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