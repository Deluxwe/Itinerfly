// ============================================================
// src/middleware/rateLimiter.js
//
// Limita cuántas peticiones puede hacer una misma IP.
// Protege la API de dos tipos de abuso:
//
// 1. Scraping masivo (alguien descargando todos los datos)
// 2. Brute force en el login (adivinar contraseñas)
// ============================================================

const rateLimit = require("express-rate-limit");
const config    = require("../config");

/**
 * Límite general para endpoints de vuelos y aerolíneas
 * 100 peticiones cada 15 minutos por IP
 * En desarrollo no aplica el límite para no molestarnos
 */
const flightLimiter = rateLimit({
  windowMs:        config.rateLimit.windowMs, // 15 minutos
  max:             config.rateLimit.max,       // 100 peticiones
  standardHeaders: true,   // Agrega headers RateLimit-* a la respuesta
  legacyHeaders:   false,
  skip: () => config.isDev, // En desarrollo no limitamos
  message: {
    success:   false,
    error:     "Demasiadas peticiones. Intenta en 15 minutos.",
    timestamp: new Date().toISOString(),
  },
});

/**
 * Límite estricto para el endpoint de login
 * Solo 10 intentos cada 15 minutos por IP
 * skipSuccessfulRequests: solo cuenta los intentos FALLIDOS
 */
const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000, // 15 minutos
  max:                    10,              // 10 intentos fallidos máximo
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,            // Los logins exitosos no cuentan
  message: {
    success:   false,
    error:     "Demasiados intentos fallidos. Intenta en 15 minutos.",
    timestamp: new Date().toISOString(),
  },
});

module.exports = { flightLimiter, authLimiter };
