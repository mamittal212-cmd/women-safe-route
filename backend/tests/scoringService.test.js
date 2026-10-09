
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateSafetyScore,
  calculateConfidence,
  buildSafetyResult,
} = require("../services/safety/scoringService");

const {
  SAFETY_WEIGHTS,
} = require("../services/safety/safetyConfig");

test("safety weights add up to 1", () => {
  const totalWeight = Object.values(
    SAFETY_WEIGHTS
  ).reduce((sum, weight) => sum + weight, 0);

  assert.ok(
    Math.abs(totalWeight - 1) < 1e-10,
    `Expected weights to total 1, got ${totalWeight}`
  );
});

test("calculateSafetyScore returns the weighted score", () => {
  const factors = {
    roadSafety: 80,
    accessibility: 70,
    routeLength: 90,
    routeTime: 85,
    isolation: 75,
    emergencyAccess: 80,
    reliability: 95,
  };

  const expected = Math.round(
    Object.entries(SAFETY_WEIGHTS).reduce(
      (sum, [factor, weight]) =>
        sum + factors[factor] * weight,
      0
    )
  );

  assert.equal(
    calculateSafetyScore(factors),
    expected
  );
});

test("calculateSafetyScore rounds the result", () => {
  const factors = Object.fromEntries(
    Object.keys(SAFETY_WEIGHTS).map(
      (factor) => [factor, 80]
    )
  );

  assert.equal(calculateSafetyScore(factors), 80);
});

test("calculateConfidence is 43 when three real-data factors exist", () => {
  const factors = {
    routeLength: 90,
    routeTime: 85,
    reliability: 95,
    roadSafety: 75,
    accessibility: 75,
    isolation: 70,
    emergencyAccess: 75,
  };

  assert.equal(calculateConfidence(factors), 43);
});

test("calculateConfidence is zero when no real-data factors exist", () => {
  const factors = {
    roadSafety: 75,
    accessibility: 75,
    isolation: 70,
    emergencyAccess: 75,
  };

  assert.equal(calculateConfidence(factors), 0);
});

test("buildSafetyResult returns score, confidence and factors", () => {
  const factors = {
    roadSafety: 80,
    accessibility: 70,
    routeLength: 90,
    routeTime: 85,
    isolation: 75,
    emergencyAccess: 80,
    reliability: 95,
  };

  const result = buildSafetyResult(factors);

  assert.equal(
    result.safetyScore,
    calculateSafetyScore(factors)
  );

  assert.equal(
    result.confidence,
    calculateConfidence(factors)
  );

  assert.deepEqual(result.factors, factors);
});
