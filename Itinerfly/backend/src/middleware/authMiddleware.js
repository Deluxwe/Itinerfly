// ============================================================
// src/middleware/authMiddleware.js
//
// Verifica que el token JWT sea válido.
// Solo se usa en rutas que requieren rol AMW.
// Actualmente protege: POST /logout y GET /me
// ============================================================

const jwt    = require("jsonwebtoken");
const config = require("../config");
const { clientError } = require("../utils/responseHelpers");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Extraer token del header Authorization: Bearer <token>
  if (!authHeader?.startsWith("Bearer ")) {
    return clientError(res, "Token requerido.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificar firma y expiración
    req.user = jwt.verify(token, config.jwt.secret);
    next(); // Token válido → pasar al controlador
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return clientError(res, "Sesión expirada. Inicia sesión nuevamente.", 401);
    }
    return clientError(res, "Token inválido.", 401);
  }
}

// Verifica que el usuario sea específicamente AMW
function requireAMW(req, res, next) {
  if (req.user?.role !== "AMW") {
    return clientError(res, "Acceso denegado. Se requiere rol AMW.", 403);
  }
  next();
}

module.exports = { requireAuth, requireAMW };
