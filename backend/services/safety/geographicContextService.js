const OVERPASS_URL =
  "https://overpass-api.de/api/interpreter";

const SAMPLE_LIMIT = 20;
const SEARCH_RADIUS = 15;

const OVERPASS_TIMEOUT = 5000;

// Successful geographic results stay cached
// for 10 minutes.
const CACHE_TTL = 10 * 60 * 1000;

// Failed requests stay cached briefly so we
// don't repeatedly hit an unavailable service.
const FAILURE_CACHE_TTL = 60 * 1000;

const geographicCache = new Map();

function sampleRouteCoordinates(geometry) {
  if (
    !geometry ||
    !Array.isArray(geometry.coordinates)
  ) {
    return [];
  }

  const coordinates =
    geometry.coordinates;

  if (
    coordinates.length <= SAMPLE_LIMIT
  ) {
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
    const index = Math.round(
      i * step
    );

    samples.push(
      coordinates[index]
    );
  }

  return samples;
}

function createCacheKey(
  coordinates
) {
  return coordinates
    .map(
      ([longitude, latitude]) =>
        `${longitude.toFixed(
          4
        )},${latitude.toFixed(4)}`
    )
    .join("|");
}

function buildOverpassQuery(
  coordinates
) {
  const lineString =
    coordinates
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

async function queryOverpass(
  query
) {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => {
      controller.abort();
    },
    OVERPASS_TIMEOUT
  );

  try {
    const response =
      await fetch(
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
            `data=${encodeURIComponent(
              query
            )}`,

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
    if (
      error.name ===
      "AbortError"
    ) {
      throw new Error(
        "Overpass request timed out."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function classifyRoadType(
  highway
) {
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

  if (
    majorRoads.includes(
      highway
    )
  ) {
    return "major";
  }

  if (
    secondaryRoads.includes(
      highway
    )
  ) {
    return "secondary";
  }

  if (
    localRoads.includes(
      highway
    )
  ) {
    return "local";
  }

  return "other";
}

function buildRoadSummary(
  elements
) {
  const roadTypes = {
    major: 0,
    secondary: 0,
    local: 0,
    other: 0,
    unknown: 0,
  };

  const highwayTypes = {};

  elements.forEach(
    (element) => {
      const highway =
        element.tags?.highway;

      if (!highway) {
        return;
      }

      highwayTypes[highway] =
        (highwayTypes[highway] ||
          0) +
        1;

      const category =
        classifyRoadType(
          highway
        );

      roadTypes[category]++;
    }
  );

  return {
    totalRoads:
      elements.length,

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

function getUnavailableContext(
  reason,
  samplePoints = 0
) {
  return {
    available: false,

    source:
      "openstreetmap-overpass",

    status:
      "temporarily_unavailable",

    reason,

    samplePoints,

    searchRadius:
      SEARCH_RADIUS,

    roadSummary:
      getEmptyRoadSummary(),
  };
}

async function getGeographicContext(
  route
) {
  if (!route?.geometry) {
    return getUnavailableContext(
      "Route geometry is unavailable."
    );
  }

  const coordinates =
    sampleRouteCoordinates(
      route.geometry
    );

  if (!coordinates.length) {
    return getUnavailableContext(
      "No route coordinates available."
    );
  }

  const cacheKey =
    createCacheKey(
      coordinates
    );

  const cached =
    geographicCache.get(
      cacheKey
    );

  if (cached) {
    const age =
      Date.now() -
      cached.timestamp;

    if (
      age <
      cached.ttl
    ) {
      return {
        ...cached.data,

        cache: {
          hit: true,
          ageMs: age,
        },
      };
    }

    geographicCache.delete(
      cacheKey
    );
  }

  try {
    const query =
      buildOverpassQuery(
        coordinates
      );

    const data =
      await queryOverpass(
        query
      );

    const elements =
      Array.isArray(
        data.elements
      )
        ? data.elements
        : [];

    const roadSummary =
      buildRoadSummary(
        elements
      );

    const result = {
      available: true,

      source:
        "openstreetmap-overpass",

      status: "available",

      samplePoints:
        coordinates.length,

      searchRadius:
        SEARCH_RADIUS,

      roadSummary,

      cache: {
        hit: false,
      },
    };

    geographicCache.set(
      cacheKey,
      {
        data: result,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
      }
    );

    return result;
  } catch (error) {
    console.warn(
      "Geographic context unavailable:",
      error.message
    );

    const result =
      getUnavailableContext(
        error.message,
        coordinates.length
      );

    geographicCache.set(
      cacheKey,
      {
        data: result,
        timestamp: Date.now(),
        ttl:
          FAILURE_CACHE_TTL,
      }
    );

    return {
      ...result,

      cache: {
        hit: false,
      },
    };
  }
}

module.exports = {
  getGeographicContext,
};