const express = require("express");
const { searchLocation } = require("../controllers/geocodeController");

const router = express.Router();

router.get("/", searchLocation);

module.exports = router;