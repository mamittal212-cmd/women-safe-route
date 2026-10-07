const express = require("express");
const { calculateRoutes } = require("../controllers/routeController");

const router = express.Router();

router.get("/", calculateRoutes);

module.exports = router;