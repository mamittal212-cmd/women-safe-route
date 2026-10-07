import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ==========================================
// MAP AUTO FIT
// ==========================================

function MapUpdater({
  routes,
  startLocation,
  destinationLocation,
}) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    // Add all route coordinates
    routes.forEach((route) => {
      if (route.geometry?.coordinates) {
        route.geometry.coordinates.forEach(
          ([longitude, latitude]) => {
            points.push([
              latitude,
              longitude,
            ]);
          }
        );
      }
    });

    // Add starting location
    if (startLocation) {
      points.push([
        startLocation.latitude,
        startLocation.longitude,
      ]);
    }

    // Add destination
    if (destinationLocation) {
      points.push([
        destinationLocation.latitude,
        destinationLocation.longitude,
      ]);
    }

    // Nothing to fit
    if (points.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
      animate: true,
      duration: 0.8,
    });
  }, [
    routes,
    startLocation,
    destinationLocation,
    map,
  ]);

  return null;
}


// ==========================================
// FIT ROUTE BUTTON
// ==========================================

function FitRouteButton({
  routes,
  startLocation,
  destinationLocation,
}) {
  const map = useMap();

  function fitRoute() {
    const points = [];

    // Add all route coordinates
    routes.forEach((route) => {
      if (route.geometry?.coordinates) {
        route.geometry.coordinates.forEach(
          ([longitude, latitude]) => {
            points.push([
              latitude,
              longitude,
            ]);
          }
        );
      }
    });

    // Add starting location
    if (startLocation) {
      points.push([
        startLocation.latitude,
        startLocation.longitude,
      ]);
    }

    // Add destination
    if (destinationLocation) {
      points.push([
        destinationLocation.latitude,
        destinationLocation.longitude,
      ]);
    }

    if (points.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
      animate: true,
    });
  }

  return (
    <button
      className="fit-route-button"
      onClick={fitRoute}
    >
      ⛶ Fit Route
    </button>
  );
}


// ==========================================
// MAIN MAP COMPONENT
// ==========================================

function MapView({
  routes = [],
  startLocation,
  destinationLocation,
  selectedRouteId,
  onRouteSelect,
}) {
  const defaultPosition = [
    30.7333,
    76.7794,
  ];

  // Convert OSRM coordinates:
  // [longitude, latitude]
  //
  // into Leaflet coordinates:
  // [latitude, longitude]

  function getRoutePositions(route) {
    if (!route.geometry?.coordinates) {
      return [];
    }

    return route.geometry.coordinates.map(
      ([longitude, latitude]) => [
        latitude,
        longitude,
      ]
    );
  }

  return (
    <MapContainer
      center={defaultPosition}
      zoom={12}
      scrollWheelZoom={true}
      className="leaflet-map"
    >

      {/* ================================== */}
      {/* MAP TILES */}
      {/* ================================== */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* ================================== */}
      {/* AUTOMATIC MAP FIT */}
      {/* ================================== */}

      <MapUpdater
        routes={routes}
        startLocation={startLocation}
        destinationLocation={
          destinationLocation
        }
      />


      {/* ================================== */}
      {/* FIT ROUTE BUTTON */}
      {/* ================================== */}

      <FitRouteButton
        routes={routes}
        startLocation={startLocation}
        destinationLocation={
          destinationLocation
        }
      />


      {/* ================================== */}
      {/* STARTING LOCATION */}
      {/* ================================== */}

      {startLocation && (
        <Marker
          position={[
            startLocation.latitude,
            startLocation.longitude,
          ]}
        >
          <Popup>
            <strong>
              Starting Location
            </strong>

            <br />

            {startLocation.name}
          </Popup>
        </Marker>
      )}


      {/* ================================== */}
      {/* DESTINATION */}
      {/* ================================== */}

      {destinationLocation && (
        <Marker
          position={[
            destinationLocation.latitude,
            destinationLocation.longitude,
          ]}
        >
          <Popup>
            <strong>
              Destination
            </strong>

            <br />

            {destinationLocation.name}
          </Popup>
        </Marker>
      )}


      {/* ================================== */}
      {/* ROUTES */}
      {/* ================================== */}

      {routes.map((route) => {
        const positions =
          getRoutePositions(route);

        const isSelected =
          selectedRouteId === route.id;

        return (
          <Polyline
            key={route.id}
            positions={positions}
            eventHandlers={{
              click: () => {
                if (onRouteSelect) {
                  onRouteSelect(
                    route.id
                  );
                }
              },
            }}
            pathOptions={{
              weight: isSelected
                ? 7
                : 4,

              opacity: isSelected
                ? 1
                : 0.35,

              className: isSelected
                ? "selected-route"
                : "alternative-route",
            }}
          />
        );
      })}

    </MapContainer>
  );
}

export default MapView;