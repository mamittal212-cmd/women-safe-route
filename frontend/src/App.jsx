import { useState } from "react";
import "./App.css";

import MapView from "./components/MapView";
import LocationSearch from "./components/LocationSearch";
import SafetyScore from "./components/SafetyScore";
import SafetyBreakdown from "./components/SafetyBreakdown";

import { getRoutes } from "./services/api";

function App() {
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFindRoutes() {
    setError("");
    setSelectedRouteId(null);

    if (!startLocation || !destinationLocation) {
      setError("Please select both a starting location and a destination.");
      return;
    }

    try {
      setLoading(true);

      const routeData = await getRoutes(startLocation, destinationLocation);

      setRoutes(routeData);

      if (routeData.length > 0) {
        setSelectedRouteId(routeData[0].id);
      }
    } catch (error) {
      console.error("Route calculation error:", error);

      setError("Unable to calculate routes. Please try again.");

      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  function getFastestRoute() {
    if (routes.length === 0) return null;

    return routes.reduce((fastest, route) =>
      route.duration < fastest.duration ? route : fastest,
    );
  }

  function getSafestRoute() {
    if (routes.length === 0) return null;

    return routes.reduce((safest, route) =>
      route.safetyScore > safest.safetyScore ? route : safest,
    );
  }

  function getBalancedRoute() {
    if (routes.length === 0) return null;

    const fastest = getFastestRoute();
    const safest = getSafestRoute();

    if (!fastest || !safest) return routes[0];

    let bestRoute = routes[0];
    let bestScore = -Infinity;

    routes.forEach((route) => {
      const safetyDifference = Math.abs(route.safetyScore - safest.safetyScore);

      const timeDifference = Math.abs(route.duration - fastest.duration);

      const normalizedSafety =
        1 - safetyDifference / Math.max(safest.safetyScore, 1);

      const normalizedTime = 1 - timeDifference / Math.max(fastest.duration, 1);

      const balancedScore = normalizedSafety * 0.6 + normalizedTime * 0.4;

      if (balancedScore > bestScore) {
        bestScore = balancedScore;
        bestRoute = route;
      }
    });

    return bestRoute;
  }

  function getRouteType(route) {
    const fastest = getFastestRoute();
    const safest = getSafestRoute();
    const balanced = getBalancedRoute();

    if (!route) return "";

    if (safest?.id === route.id) {
      return "safest";
    }

    if (fastest?.id === route.id) {
      return "fastest";
    }

    if (balanced?.id === route.id) {
      return "balanced";
    }

    return "alternative";
  }

  function getRouteTitle(route) {
    const type = getRouteType(route);

    if (type === "safest") {
      return "🛡️ Safest Route";
    }

    if (type === "fastest") {
      return "⚡ Fastest Route";
    }

    if (type === "balanced") {
      return "⚖️ Balanced Route";
    }

    return "Alternative Route";
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span>SafeRoute</span>
        </div>

        <div className="version">V1.0</div>
      </header>

      <main className="main-content">
        <section className="hero">
          <p className="eyebrow">SAFETY-FIRST NAVIGATION</p>

          <h1>
            Travel smarter.
            <br />
            <span>Travel safer.</span>
          </h1>

          <p className="hero-description">
            Find routes that prioritize safety instead of simply getting you
            there faster.
          </p>
        </section>

        <section className="route-panel">
          <LocationSearch
            label="FROM"
            placeholder="Enter starting location"
            icon="start"
            onLocationSelect={setStartLocation}
          />

          <div className="route-line"></div>

          <LocationSearch
            label="DESTINATION"
            placeholder="Enter destination"
            icon="destination"
            onLocationSelect={setDestinationLocation}
          />

          {error && (
            <div className="route-error">
              <div className="route-error-content">
                <span className="route-error-icon">⚠️</span>

                <div>
                  <strong>Unable to calculate route</strong>

                  <p>{error}</p>
                </div>
              </div>

              <button className="retry-button" onClick={handleFindRoutes}>
                Try Again
              </button>
            </div>
          )}

          <button
            className="route-button"
            onClick={handleFindRoutes}
            disabled={loading}
          >
            {loading ? "Calculating routes..." : "🛡️ Find Safe Routes"}
          </button>
        </section>

        <section className="map-container">
          <MapView
            routes={routes}
            startLocation={startLocation}
            destinationLocation={destinationLocation}
            selectedRouteId={selectedRouteId}
            onRouteSelect={setSelectedRouteId}
          />

          {!startLocation && !destinationLocation && (
            <div className="map-overlay">
              <div className="map-overlay-icon">🗺️</div>

              <h3>Plan your journey</h3>

              <p>
                Enter your starting location and destination to find safer route
                options.
              </p>
            </div>
          )}

          {loading && (
            <div className="map-overlay loading-overlay">
              <div className="loading-spinner"></div>

              <h3>Finding routes</h3>

              <p>Comparing available routes...</p>
            </div>
          )}
        </section>

        {routes.length > 0 && (
          <section className="route-results">
            <div className="results-header">
              <div>
                <p className="results-eyebrow">ROUTE OPTIONS</p>

                <h2>Choose your route</h2>
              </div>

              <span className="route-count">{routes.length} routes found</span>
            </div>

            <div className="route-cards">
              {routes.map((route) => {
                const distanceKm = (route.distance / 1000).toFixed(2);

                const durationMinutes = Math.round(route.duration / 60);

                const routeType = getRouteType(route);

                const isSelected = selectedRouteId === route.id;

                return (
                  <div
                    className={`route-card ${isSelected ? "selected" : ""}`}
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <div className="route-card-header">
                      <div>
                        <h3>{getRouteTitle(route)}</h3>

                        <span className="route-badge">
                          {routeType.toUpperCase()}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="selected-badge">SELECTED</span>
                      )}
                    </div>

                    <SafetyScore
                      score={route.safetyScore}
                      confidence={route.safetyConfidence}
                    />
                    {route.geographicContext && (
                      <div className="geographic-context">
                        <div className="geographic-context-header">
                          <span>🌍 Geographic Context</span>

                          <span
                            className={
                              route.geographicContext.available ?
                                "context-status available"
                              : "context-status unavailable"
                            }
                          >
                            {route.geographicContext.available ?
                              "AVAILABLE"
                            : "UNAVAILABLE"}
                          </span>
                        </div>

                        {route.geographicContext.available ?
                          <>
                            <p className="geographic-context-source">
                              Road characteristics from OpenStreetMap
                            </p>

                            <div className="road-context-grid">
                              <div>
                                <strong>
                                  {
                                    route.geographicContext.roadSummary
                                      .roadTypes.major
                                  }
                                </strong>
                                <span>Major</span>
                              </div>

                              <div>
                                <strong>
                                  {
                                    route.geographicContext.roadSummary
                                      .roadTypes.secondary
                                  }
                                </strong>
                                <span>Secondary</span>
                              </div>

                              <div>
                                <strong>
                                  {
                                    route.geographicContext.roadSummary
                                      .roadTypes.local
                                  }
                                </strong>
                                <span>Local</span>
                              </div>
                            </div>
                          </>
                        : <p className="geographic-context-message">
                            Geographic road context is temporarily unavailable.
                            The route calculation does not depend on this data.
                          </p>
                        }
                      </div>
                    )}

                    <div className="route-stats">
                      <div>
                        <strong>{distanceKm} km</strong>

                        <small>Distance</small>
                      </div>

                      <div>
                        <strong>{durationMinutes} min</strong>

                        <small>Estimated time</small>
                      </div>
                    </div>

  <SafetyBreakdown
  breakdown={route.safetyBreakdown}
  factorDetails={route.safetyFactorDetails}
  geographicDetails={route.geographicDetails}
/>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
