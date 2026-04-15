// ============================================================
// src/utils/responseHelpers.js
//
// Funciones para enviar respuestas HTTP siempre con el mismo
// formato. Así el frontend sabe exactamente qué esperar:
//
// Éxito:  { success: true,  data: {...},    timestamp: "..." }
// Error:  { success: false, error: "...",   timestamp: "..." }
//
// Esto evita que a veces respondas { flights: [] } y otras
// veces { data: { flights: [] } } — siempre es igual.
// ============================================================

/**
 * Respuesta exitosa (código 200 por defecto)
 * Uso: return success(res, { flights: [...] })
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success:   true,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error del cliente — algo hizo mal el usuario (código 400/404/etc)
 * Uso: return clientError(res, "Fecha inválida", 400)
 */
function clientError(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success:   false,
    error:     message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error del servidor — algo salió mal en nuestro código (código 500)
 * Uso: return serverError(res, "Error al conectar con FlightAware")
 */
function serverError(res, message = "Error interno del servidor") {
  return res.status(500).json({
    success:   false,
    error:     message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { success, clientError, serverError };
