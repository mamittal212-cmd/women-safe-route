function calculateRouteContext(
  route,
  allRoutes
) {
  const distances = allRoutes.map(
    (item) => item.distance
  );

  const durations = allRoutes.map(
    (item) => item.duration
  );

  const minDistance =
    Math.min(...distances);

  const maxDistance =
    Math.max(...distances);

  const minDuration =
    Math.min(...durations);

  const maxDuration =
    Math.max(...durations);

  // Relative distance position
  let distanceRatio = 0;

  if (maxDistance !== minDistance) {
    distanceRatio =
      (route.distance - minDistance) /
      (maxDistance - minDistance);
  }

  // Relative duration position
  let durationRatio = 0;

  if (maxDuration !== minDuration) {
    durationRatio =
      (route.duration - minDuration) /
      (maxDuration - minDuration);
  }

  return {
    distance: route.distance,

    duration: route.duration,

    distanceKm:
      Number(
        (route.distance / 1000).toFixed(2)
      ),

    durationMinutes:
      Math.round(route.duration / 60),

    relativeDistance:
      Number(
        distanceRatio.toFixed(3)
      ),

    relativeDuration:
      Number(
        durationRatio.toFixed(3)
      ),

    routeCount:
      allRoutes.length,
  };
}

module.exports = {
  calculateRouteContext,
};