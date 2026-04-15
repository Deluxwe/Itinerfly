// ============================================================
// src/middleware/authMiddleware.js
//
// Verifica que el token JWT sea válido antes de dar acceso
// a los endpoints protegidos del rol AMW.
//
// ¿Cómo funciona JWT?
// 1. El usuario hace login → el servidor genera un token firmado
// 2. El frontend guarda ese token (localStorage)
// 3. En cada petición protegida, el frontend envía el token
//    en el header: Authorization: Bearer <token>
// 4. Este middleware verifica que el token sea auténtico
//    y no haya expirado
// ============================================================

const jwt    = require("jsonwebtoken");
const config = require("../config");
const { clientError } = require("../utils/responseHelpers");

/**
 * Middleware principal — verifica el token JWT
 * Si el token es válido, agrega req.user con los datos del usuario
 * Si no, responde con error 401
 */
function requireAuth(req, res, next) {
  // El token viene en el header Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return clientError(res, "Token de autorización requerido.", 401);
  }

  // Extraer solo el token (quitar "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verificar firma y expiración del token
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
      issuer:     "jfk-itinerary-backend",
      audience:   "jfk-itinerary-frontend",
    });

    // Adjuntar datos del usuario a la petición
    // Ahora cualquier controlador puede acceder a req.user
    req.user = decoded;
    next(); // Pasar al siguiente middleware o controlador

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return clientError(res, "La sesión ha expirado. Inicia sesión nuevamente.", 401);
    }
    return clientError(res, "Token inválido.", 401);
  }
}

/**
 * Verifica que el usuario tenga rol AMW específicamente
 * Se usa después de requireAuth
 */
function requireAMW(req, res, next) {
  if (!req.user || req.user.role !== "AMW") {
    return clientError(res, "Acceso denegado. Se requiere rol AMW.", 403);
  }
  next();
}

module.exports = { requireAuth, requireAMW };
