const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function getRoutes(start, destination) {
  const coordinates = `${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}`;

  const url = new URL(`${OSRM_URL}/${coordinates}`);

  url.searchParams.set("alternatives", "true");
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Routing service failed");
  }

  const data = await response.json();

  if (data.code !== "Ok") {
    throw new Error("No route found");
  }

  return data.routes;
}

module.exports = {
  getRoutes
};