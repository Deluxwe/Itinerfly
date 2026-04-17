const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

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

// Solo mostrar logs si no estamos en test (evita ruido en los tests)
if (config.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

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
// Fix: /api/routes apunta al controlador de rutas directamente, no al de airlines
app.use("/api/routes",   require("./src/routes/routeRoutes"));
app.use("/api/auth",     authRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

// Solo arrancar el servidor si NO estamos en modo test
// En tests, supertest levanta el servidor en memoria
if (config.nodeEnv !== "test") {
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
    console.log(`  POST http://localhost:${config.port}/api/auth/login`);
  });
}

module.exports = app;
