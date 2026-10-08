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
      factors[factor] * weight;
  }

  return Math.round(score);
}


function calculateConfidence(
  factors
) {
  /*
   * V2 currently has baseline data only.
   *
   * This is NOT a measurement of real-world
   * data quality yet.
   *
   * It represents how much of the future
   * safety model is currently backed by
   * actual factor data.
   */

  const realDataFactors = 0;

  const totalFactors =
    Object.keys(factors).length;

  const confidence =
    totalFactors === 0
      ? 0
      : (realDataFactors /
          totalFactors) *
        100;

  return Math.round(
    confidence
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