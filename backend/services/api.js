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