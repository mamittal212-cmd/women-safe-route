const OVERPASS_URL =
  "https://overpass-api.de/api/interpreter";

const SAMPLE_LIMIT = 20;
const SEARCH_RADIUS = 15;
const OVERPASS_TIMEOUT = 5000;

function sampleRouteCoordinates(geometry) {
  if (
    !geometry ||
    !Array.isArray(geometry.coordinates)
  ) {
    return [];
  }

  const coordinates = geometry.coordinates;

  if (coordinates.length <= SAMPLE_LIMIT) {
    return coordinates;
  }

  const samples = [];

  const step =
    (coordinates.length - 1) /
    (SAMPLE_LIMIT - 1);

  for (
    let i = 0;
    i < SAMPLE_LIMIT;
    i++
  ) {
    const index = Math.round(i * step);

    samples.push(coordinates[index]);
  }

  return samples;
}

function buildOverpassQuery(coordinates) {
  const lineString = coordinates
    .map(
      ([longitude, latitude]) =>
        `${latitude},${longitude}`
    )
    .join(",");

  return `
[out:json][timeout:5];

way
  [highway]
  (around:${SEARCH_RADIUS},${lineString});

out tags;
`;
}

async function queryOverpass(query) {
  const controller =
    new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, OVERPASS_TIMEOUT);

  try {
    const response = await fetch(
      OVERPASS_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          "User-Agent":
            "SafeRoute/2.1",
        },

        body:
          `data=${encodeURIComponent(query)}`,

        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Overpass request failed: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Overpass request timed out."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function classifyRoadType(highway) {
  if (!highway) {
    return "unknown";
  }

  const majorRoads = [
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
    "primary",
    "primary_link",
  ];

  const secondaryRoads = [
    "secondary",
    "secondary_link",
    "tertiary",
    "tertiary_link",
  ];

  const localRoads = [
    "residential",
    "living_street",
    "service",
    "unclassified",
  ];

  if (majorRoads.includes(highway)) {
    return "major";
  }

  if (secondaryRoads.includes(highway)) {
    return "secondary";
  }

  if (localRoads.includes(highway)) {
    return "local";
  }

  return "other";
}

function buildRoadSummary(elements) {
  const roadTypes = {
    major: 0,
    secondary: 0,
    local: 0,
    other: 0,
    unknown: 0,
  };

  const highwayTypes = {};

  elements.forEach((element) => {
    const highway =
      element.tags?.highway;

    if (!highway) {
      return;
    }

    highwayTypes[highway] =
      (highwayTypes[highway] || 0) + 1;

    const category =
      classifyRoadType(highway);

    roadTypes[category]++;
  });

  return {
    totalRoads: elements.length,

    roadTypes,

    highwayTypes,

    hasMajorRoads:
      roadTypes.major > 0,

    hasSecondaryRoads:
      roadTypes.secondary > 0,

    hasLocalRoads:
      roadTypes.local > 0,
  };
}

function getEmptyRoadSummary() {
  return {
    totalRoads: 0,

    roadTypes: {
      major: 0,
      secondary: 0,
      local: 0,
      other: 0,
      unknown: 0,
    },

    highwayTypes: {},

    hasMajorRoads: false,

    hasSecondaryRoads: false,

    hasLocalRoads: false,
  };
}

async function getGeographicContext(route) {
  if (!route?.geometry) {
    return {
      available: false,

      reason:
        "Route geometry is unavailable.",

      roadSummary:
        getEmptyRoadSummary(),
    };
  }

  const coordinates =
    sampleRouteCoordinates(
      route.geometry
    );

  if (!coordinates.length) {
    return {
      available: false,

      reason:
        "No route coordinates available.",

      roadSummary:
        getEmptyRoadSummary(),
    };
  }

  try {
    const query =
      buildOverpassQuery(
        coordinates
      );

    const data =
      await queryOverpass(query);

    const elements =
      Array.isArray(data.elements)
        ? data.elements
        : [];

    const roadSummary =
      buildRoadSummary(elements);

    return {
      available: true,

      samplePoints:
        coordinates.length,

      searchRadius:
        SEARCH_RADIUS,

      roadSummary,
    };
  } catch (error) {
    console.warn(
      "Geographic context unavailable:",
      error.message
    );

    return {
      available: false,

      reason: error.message,

      samplePoints:
        coordinates.length,

      searchRadius:
        SEARCH_RADIUS,

      roadSummary:
        getEmptyRoadSummary(),
    };
  }
}

module.exports = {
  getGeographicContext,
};