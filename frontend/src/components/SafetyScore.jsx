function getScoreLabel(score) {
  if (score >= 86) return "Higher Safety Score";
  if (score >= 71) return "Good Safety Score";
  if (score >= 51) return "Moderate Safety Score";
  if (score >= 31) return "Lower Safety Score";

  return "Very Low Safety Score";
}

function SafetyScore({
  score,
  confidence = 0,
}) {
  return (
    <div className="safety-score">

      <div className="safety-score-value">
        <strong>{score}</strong>
        <span>/100</span>
      </div>

      <div className="safety-score-info">

        <span className="safety-score-label">
          🛡️ {getScoreLabel(score)}
        </span>

        <div className="safety-score-bar">
          <div
            className="safety-score-fill"
            style={{
              width: `${score}%`,
            }}
          ></div>
        </div>

        <div className="safety-confidence">
          <span>
            Safety Data Coverage
          </span>

          <strong>
            {confidence}%
          </strong>
        </div>

        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${confidence}%`,
            }}
          ></div>
        </div>

      </div>
    </div>
  );
}

export default SafetyScore;