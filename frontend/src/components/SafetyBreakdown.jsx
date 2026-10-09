const factorLabels = {
  roadSafety: "Road Safety",
  accessibility: "Accessibility",
  routeLength: "Route Length",
  routeTime: "Travel Time",
  isolation: "Isolation",
  emergencyAccess: "Emergency Access",
  reliability: "Route Reliability",
};

function getFactorStatus(value) {
  if (value >= 86) return "High";
  if (value >= 71) return "Good";
  if (value >= 51) return "Moderate";
  if (value >= 31) return "Low";

  return "Very Low";
}

function SafetyBreakdown({
  breakdown,
  factorDetails,
  geographicDetails,
}) {
  if (!breakdown) {
    return null;
  }

  return (
    <div className="safety-breakdown">
      <div className="breakdown-header">
        <div>
          <h4>Safety Breakdown</h4>
          <p>
            How this route's score is calculated
          </p>
        </div>
      </div>

      <div className="breakdown-list">
        {Object.entries(breakdown).map(
          ([key, value]) => {
            const details = factorDetails?.[key];
            const geographic = geographicDetails?.[key];

            const showGeographicDetails =
              geographic?.available === true;

            return (
              <div
                className="breakdown-item"
                key={key}
              >
                <div className="breakdown-label">
                  <div>
                    <span>
                      {details?.label ||
                        factorLabels[key] ||
                        key}
                    </span>

                    <small>
                      {details?.description ||
                        "Safety factor used in the route score."}
                    </small>
                  </div>

                  <strong>{value}</strong>
                </div>

                <div className="breakdown-status">
                  {getFactorStatus(value)}
                </div>

                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${value}%`,
                    }}
                  />
                </div>

                {showGeographicDetails && (
                  <div className="geographic-factor-details">
                    <div>
                      <span>Baseline</span>
                      <strong>
                        {geographic.baseline}
                      </strong>
                    </div>

                    <div>
                      <span>Geographic adjustment</span>
                      <strong>
                        {geographic.adjustment > 0
                          ? `+${geographic.adjustment}`
                          : geographic.adjustment}
                      </strong>
                    </div>

                    <div>
                      <span>Adjusted score</span>
                      <strong>
                        {geographic.finalScore}
                      </strong>
                    </div>

                    <small>
                      Prototype heuristic based on
                      geographic road classifications;
                      not verified safety or crime data.
                    </small>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <div className="prototype-note">
        ℹ️ Some factors still use prototype baseline
        values. Geographic adjustments appear only
        when road classification data is available.
        These classifications do not establish actual
        crime risk or personal safety.
      </div>
    </div>
  );
}

export default SafetyBreakdown;