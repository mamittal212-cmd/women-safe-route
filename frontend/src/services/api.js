const API_BASE_URL = "http://localhost:5000/api";

export async function searchLocation(query) {
  const response = await fetch(
    `${API_BASE_URL}/geocode?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Unable to search location");
  }

  const data = await response.json();

  return data.results;
}

export async function getRoutes(startLocation, destinationLocation) {
  const params = new URLSearchParams({
    startLat: startLocation.latitude,
    startLng: startLocation.longitude,
    destinationLat: destinationLocation.latitude,
    destinationLng: destinationLocation.longitude,
  });

  const response = await fetch(
    `${API_BASE_URL}/routes?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Unable to calculate routes");
  }

  const data = await response.json();

  return data.routes;
}