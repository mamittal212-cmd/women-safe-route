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
  if (value >= 86) {
    return "High";
  }

  if (value >= 71) {
    return "Good";
  }

  if (value >= 51) {
    return "Moderate";
  }

  if (value >= 31) {
    return "Low";
  }

  return "Very Low";
}

function SafetyBreakdown({
  breakdown,
  factorDetails,
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

            const details =
              factorDetails?.[key];

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

                  <strong>
                    {value}
                  </strong>

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
                  ></div>

                </div>

              </div>
            );
          }
        )}

      </div>

      <div className="prototype-note">
        ℹ️ V2 currently uses baseline factor
        values. Real geographic safety data
        will be integrated in later V2 stages.
      </div>

    </div>
  );
}

export default SafetyBreakdown;