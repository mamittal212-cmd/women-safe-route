const factorLabels = {
  roadSafety: "Road Safety",
  accessibility: "Accessibility",
  routeLength: "Route Length",
  routeTime: "Travel Time",
  isolation: "Isolation",
  emergencyAccess: "Emergency Access",
  reliability: "Route Reliability",
};

function SafetyBreakdown({ breakdown }) {
  if (!breakdown) {
    return null;
  }

  return (
    <div className="safety-breakdown">
      <div className="breakdown-header">
        <div>
          <h4>Safety Breakdown</h4>
          <p>V1 prototype scoring model</p>
        </div>
      </div>

      <div className="breakdown-list">
        {Object.entries(breakdown).map(
          ([key, value]) => (
            <div
              className="breakdown-item"
              key={key}
            >
              <div className="breakdown-label">
                <span>
                  {factorLabels[key] || key}
                </span>

                <strong>{value}</strong>
              </div>

              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="prototype-note">
        ℹ️ This is a prototype estimate. V2 will use
        real safety data.
      </div>
    </div>
  );
}

export default SafetyBreakdown;