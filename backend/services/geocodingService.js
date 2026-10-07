const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function geocodeLocation(query) {
  const url = new URL(NOMINATIM_URL);

  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SafeRoute/1.0"
    }
  });

  if (!response.ok) {
    throw new Error("Geocoding service failed");
  }

  const data = await response.json();

  return data.map((place) => ({
    name: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon)
  }));
}

module.exports = {
  geocodeLocation
};