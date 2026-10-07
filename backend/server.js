const geocodeRoutes = require("./routes/geocodeRoutes");
const routeRoutes = require("./routes/routeRoutes");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/geocode", geocodeRoutes);
app.use("/api/routes", routeRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SafeRoute API is running 🚀",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SafeRoute Backend"
  });
});

app.listen(PORT, () => {
  console.log(`SafeRoute backend running on http://localhost:${PORT}`);
});