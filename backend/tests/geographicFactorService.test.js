const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateRoadContextAdjustment,
  calculateGeographicRoadSafety,
  calculateGeographicAccessibility,
  calculateGeographicEmergencyAccess,
} = require("../services/safety/geographicFactorService");

const {
  calculateRouteFactors,
} = require("../services/safety/factorService");

const availableContext = {
  available: true,
  source: "test-source",
  roadSummary: {
    roadTypes: {
      major: 5,
      secondary: 3,
      local: 2,
      other: 0,
      unknown: 0,
    },
  },
};

test("unavailable geographic data produces zero adjustment", () => {
  const result = calculateRoadContextAdjustment(null);

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("geographic data marked unavailable produces zero adjustment", () => {
  const result = calculateRoadContextAdjustment({
    ...availableContext,
    available: false,
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("missing road classifications are handled gracefully", () => {
  const result = calculateRoadContextAdjustment({
    available: true,
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("zero classified roads produce zero adjustment", () => {
  const result = calculateRoadContextAdjustment({
    available: true,
    roadSummary: {
      roadTypes: {
        major: 0,
        secondary: 0,
        local: 0,
        other: 0,
        unknown: 0,
      },
    },
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("road adjustment uses the configured heuristic", () => {
  const result =
    calculateRoadContextAdjustment(availableContext);

  assert.equal(result.available, true);
  assert.equal(result.adjustment, 3.5);

  assert.deepEqual(result.roadRatios, {
    major: 0.5,
    secondary: 0.3,
    local: 0.2,
  });

  assert.equal(result.source, "test-source");
});

test("road safety applies the adjustment to its baseline", () => {
  const result =
    calculateGeographicRoadSafety(75, availableContext);

  assert.equal(result.score, 79);
  assert.equal(result.context.baseline, 75);
  assert.equal(result.context.finalScore, 79);
  assert.equal(result.context.adjustment, 3.5);
});

test("accessibility applies the adjustment to its baseline", () => {
  const result =
    calculateGeographicAccessibility(75, availableContext);

  assert.equal(result.score, 79);
  assert.equal(result.context.finalScore, 79);
});

test("emergency access multiplies the adjustment by 1.5", () => {
  const result =
    calculateGeographicEmergencyAccess(75, availableContext);

  assert.equal(result.context.adjustment, 5.25);
  assert.equal(result.score, 80);
  assert.equal(result.context.finalScore, 80);
});

test("geographic scores are clamped to a maximum of 100", () => {
  const context = {
    available: true,
    roadSummary: {
      roadTypes: {
        major: 10,
        secondary: 0,
        local: 0,
        other: 0,
        unknown: 0,
      },
    },
  };

  const result = calculateGeographicRoadSafety(99, context);

  assert.equal(result.score, 100);
});

test("geographic scores are clamped to a minimum of zero", () => {
  const context = {
    available: true,
    roadSummary: {
      roadTypes: {
        major: 0,
        secondary: 0,
        local: 10,
        other: 0,
        unknown: 0,
      },
    },
  };

  const result = calculateGeographicRoadSafety(1, context);

  assert.equal(result.score, 0);
});

test("route factors remain numeric when geographic data is unavailable", () => {
  const route = {
    distance: 1000,
    duration: 300,
  };

  const result = calculateRouteFactors(
    route,
    [route],
    {
      relativeDistance: 0,
      relativeDuration: 0,
    }
  );

  const factors = result.factors;

  assert.deepEqual(
    Object.keys(factors).sort(),
    [
      "accessibility",
      "emergencyAccess",
      "isolation",
      "reliability",
      "roadSafety",
      "routeLength",
      "routeTime",
    ].sort()
  );

  for (const [name, score] of Object.entries(factors)) {
    assert.equal(
      typeof score,
      "number",
      `${name} should be numeric`
    );
    assert.ok(
      score >= 0 && score <= 100,
      `${name} should be between 0 and 100`
    );
  }

  assert.equal(factors.roadSafety, 75);
  assert.equal(factors.accessibility, 75);
  assert.equal(factors.emergencyAccess, 75);
  assert.equal(factors.isolation, 70);

  assert.equal(
    result.geographicDetails.roadSafety.available,
    false
  );
});

test("route factors expose geographic adjustments when context is available", () => {
  const route = {
    distance: 1000,
    duration: 300,
  };

  const result = calculateRouteFactors(
    route,
    [route],
    {
      relativeDistance: 0,
      relativeDuration: 0,
    },
    availableContext
  );

  assert.equal(result.factors.roadSafety, 79);
  assert.equal(result.factors.accessibility, 79);
  assert.equal(result.factors.emergencyAccess, 80);

  assert.equal(
    result.geographicDetails.roadSafety.available,
    true
  );

  assert.equal(
    result.geographicDetails.roadSafety.adjustment,
    3.5
  );
});

test("missing road counts are rejected", () => {
  const result = calculateRoadContextAdjustment({
    available: true,
    roadSummary: {
      roadTypes: {
        major: 5,
        secondary: 3,
        local: 2,
      },
    },
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("negative road counts are rejected", () => {
  const result = calculateRoadContextAdjustment({
    available: true,
    roadSummary: {
      roadTypes: {
        major: 5,
        secondary: 3,
        local: -2,
        other: 0,
        unknown: 0,
      },
    },
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

test("non-finite road counts are rejected", () => {
  const result = calculateRoadContextAdjustment({
    available: true,
    roadSummary: {
      roadTypes: {
        major: Infinity,
        secondary: 3,
        local: 2,
        other: 0,
        unknown: 0,
      },
    },
  });

  assert.equal(result.available, false);
  assert.equal(result.adjustment, 0);
});

