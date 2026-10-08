const SAFETY_WEIGHTS = {
  roadSafety: 0.20,
  accessibility: 0.15,
  routeLength: 0.10,
  routeTime: 0.10,
  isolation: 0.15,
  emergencyAccess: 0.15,
  reliability: 0.15,
};

const SAFETY_FACTORS = {
  roadSafety: {
    label: "Road Safety",
    description:
      "Estimated quality and suitability of the roads used by the route.",
  },

  accessibility: {
    label: "Accessibility",
    description:
      "Estimated accessibility of the route for normal road users.",
  },

  routeLength: {
    label: "Route Length",
    description:
      "Relative distance compared with the available routes.",
  },

  routeTime: {
    label: "Travel Time",
    description:
      "Relative travel time compared with the available routes.",
  },

  isolation: {
    label: "Isolation",
    description:
      "Estimated level of route isolation.",
  },

  emergencyAccess: {
    label: "Emergency Access",
    description:
      "Estimated accessibility for emergency assistance.",
  },

  reliability: {
    label: "Route Reliability",
    description:
      "Estimated reliability of the route.",
  },
};

module.exports = {
  SAFETY_WEIGHTS,
  SAFETY_FACTORS,
};