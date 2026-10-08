const express = require("express");

const {
  analyzeGeographicContext,
} = require("../controllers/geographicContextController");

const router = express.Router();

router.post(
  "/",
  analyzeGeographicContext
);

module.exports = router;