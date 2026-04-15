const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

// Las rutas ahora apuntan a ./src/ (no a ../)
const config = require("./src/config");
const flightRoutes  = require("./src/routes/flightRoutes");
const airlineRoutes = require("./src/routes/airlineRoutes");
const authRoutes    = require("./src/routes/authRoutes");
const { notFoundHandler, globalErrorHandler } = require("./src/middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors({
  origin:         config.corsOrigin,
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials:    true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(morgan(config.isDev ? "dev" : "combined"));

// Health check — para verificar que el servidor está vivo
app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    service:   "jfk-itinerary-backend",
    mode:      config.useMockData ? "MOCK" : "LIVE (FlightAware)",
    airport:   config.airport.iata,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/flights",  flightRoutes);
app.use("/api/airlines", airlineRoutes);
app.use("/api/routes",   airlineRoutes);
app.use("/api/auth",     authRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✈  JFK Itinerary — Backend API          ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  Puerto   : ${config.port}                              ║`);
  console.log(`║  Modo     : ${config.useMockData ? "MOCK (sin API key)    " : "LIVE FlightAware     "} ║`);
  console.log(`║  Aeropuerto: ${config.airport.iata} / ${config.airport.icao}                   ║`);
  console.log("╚════════════════════════════════════════════╝\n");
  console.log(`  GET  http://localhost:${config.port}/health`);
  console.log(`  GET  http://localhost:${config.port}/api/flights/departures`);
  console.log(`  GET  http://localhost:${config.port}/api/flights/arrivals`);
  console.log(`  GET  http://localhost:${config.port}/api/flights/AA101`);
  console.log(`  GET  http://localhost:${config.port}/api/airlines`);
  console.log(`  POST http://localhost:${config.port}/api/auth/login\n`);
});

module.exports = app;
