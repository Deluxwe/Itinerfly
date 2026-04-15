// ============================================================
// src/config/index.js
//
// Este archivo lee todas las variables del .env y las exporta
// en un objeto organizado. El resto del código solo importa
// este archivo, nunca usa process.env directamente.
//
// Ventaja: si cambias una variable de entorno, solo cambias
// el .env, no tienes que buscar en 10 archivos diferentes.
// ============================================================

require("dotenv").config(); // Carga el archivo .env

const config = {

  // ── Servidor ─────────────────────────────────────────
  port: parseInt(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Atajo para saber si estamos en desarrollo
  isDev: process.env.NODE_ENV !== "production",

  // ── Interruptor mock/real ─────────────────────────────
  // Cuando esto es true, el backend devuelve datos falsos
  // Cuando es false, llama a FlightAware de verdad
  useMockData: process.env.USE_MOCK_DATA === "true",

  // ── FlightAware API ───────────────────────────────────
  flightAware: {
    apiKey:  process.env.FLIGHTAWARE_API_KEY  || "",
    baseUrl: process.env.FLIGHTAWARE_BASE_URL || "https://aeroapi.flightaware.com/aeroapi",
  },

  // ── Aeropuerto ────────────────────────────────────────
  airport: {
    icao: process.env.AIRPORT_ICAO || "KJFK", // Código OACI
    iata: process.env.AIRPORT_IATA || "JFK",  // Código IATA
  },

  // ── JWT para el rol AMW ───────────────────────────────
  jwt: {
    secret:    process.env.JWT_SECRET     || "secreto_dev",
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  },

  // ── CORS ──────────────────────────────────────────────
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // ── Rate limiting ─────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max:      parseInt(process.env.RATE_LIMIT_MAX)       || 100,
  },
};

// Aviso en consola si el modo mock está activo
if (config.useMockData) {
  console.log("⚠️  MODO MOCK ACTIVO — usando datos de prueba (no se llama a FlightAware)");
  console.log("   Para usar datos reales: cambia USE_MOCK_DATA=false en el .env");
}

module.exports = config;
