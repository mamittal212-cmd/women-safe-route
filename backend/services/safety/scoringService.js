const {
  SAFETY_WEIGHTS,
} = require("./safetyConfig");


function calculateSafetyScore(
  factors
) {
  let score = 0;

  for (const [
    factor,
    weight,
  ] of Object.entries(
    SAFETY_WEIGHTS
  )) {
    score +=
      factors[factor] *
      weight;
  }

  return Math.round(score);
}


function calculateConfidence(
  factors
) {
  const realDataFactors = [
    "routeLength",
    "routeTime",
    "reliability",
  ];

  const availableRealData =
    realDataFactors.filter(
      (factor) =>
        typeof factors[factor] ===
        "number"
    ).length;

  const totalFactors =
    Object.keys(
      SAFETY_WEIGHTS
    ).length;

  if (!totalFactors) {
    return 0;
  }

  return Math.round(
    (availableRealData /
      totalFactors) *
      100
  );
}


function buildSafetyResult(
  factors
) {
  const safetyScore =
    calculateSafetyScore(
      factors
    );

  const confidence =
    calculateConfidence(
      factors
    );

  return {
    safetyScore,
    confidence,
    factors,
  };
}


module.exports = {
  calculateSafetyScore,
  calculateConfidence,
  buildSafetyResult,
};