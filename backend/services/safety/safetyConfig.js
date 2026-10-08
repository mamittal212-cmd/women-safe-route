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
      "Prototype baseline. Real road-risk information will be introduced through geographic and safety datasets.",
    dataSource:
      "prototype-baseline",
    status:
      "prototype",
  },

  accessibility: {
    label: "Accessibility",
    description:
      "Prototype baseline. Future versions will consider road classification, pedestrian infrastructure and accessibility data.",
    dataSource:
      "prototype-baseline",
    status:
      "prototype",
  },

  routeLength: {
    label: "Route Length",
    description:
      "Compares this route's distance with the available alternatives.",
    dataSource:
      "routing-data",
    status:
      "calculated",
  },

  routeTime: {
    label: "Travel Time",
    description:
      "Compares this route's estimated travel time with the available alternatives.",
    dataSource:
      "routing-data",
    status:
      "calculated",
  },

  isolation: {
    label: "Isolation",
    description:
      "Prototype baseline. Future versions will consider population density, pedestrian activity, land use and lighting.",
    dataSource:
      "prototype-baseline",
    status:
      "prototype",
  },

  emergencyAccess: {
    label: "Emergency Access",
    description:
      "Prototype baseline. Future versions will consider nearby emergency facilities and road accessibility.",
    dataSource:
      "prototype-baseline",
    status:
      "prototype",
  },

  reliability: {
    label: "Route Reliability",
    description:
      "Estimates route reliability using relative distance and travel time.",
    dataSource:
      "routing-data",
    status:
      "calculated",
  },
};


module.exports = {
  SAFETY_WEIGHTS,
  SAFETY_FACTORS,
};