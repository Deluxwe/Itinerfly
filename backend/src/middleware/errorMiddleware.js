// ============================================================
// src/middleware/errorMiddleware.js
//
// Dos middlewares que van AL FINAL de todos los demás:
//
// 1. notFoundHandler: atrapa peticiones a rutas que no existen
// 2. globalErrorHandler: atrapa cualquier error no manejado
// ============================================================

const config = require("../config");

/**
 * Responde con 404 cuando alguien llama a una ruta que no existe
 * Ejemplo: GET /api/inventado → "Ruta no encontrada"
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success:   false,
    error:     `Ruta no encontrada: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Captura cualquier error que no fue manejado en los controladores
 * Express lo reconoce como manejador de errores por tener 4 parámetros (err, req, res, next)
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  console.error("[Error no manejado]", err.stack || err.message);

  const respuesta = {
    success:   false,
    error:     err.message || "Error interno del servidor.",
    timestamp: new Date().toISOString(),
  };

  // En desarrollo mostramos el stack trace para depurar más fácil
  if (config.isDev) {
    respuesta.stack = err.stack;
  }

  res.status(err.status || 500).json(respuesta);
}

module.exports = { notFoundHandler, globalErrorHandler };
