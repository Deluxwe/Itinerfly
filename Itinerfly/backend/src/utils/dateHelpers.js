// ============================================================
// src/utils/dateHelpers.js
//
// Funciones pequeñas para manejar fechas.
// Se usan en varios lugares del backend así que las
// centralizamos aquí para no repetir código.
// ============================================================

/**
 * Agrega N días a una fecha
 * Ejemplo: addDays(new Date(), 2) → pasado mañana
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Convierte una fecha a string formato YYYY-MM-DD
 * Ejemplo: toDateString(new Date()) → "2024-10-15"
 */
function toDateString(date) {
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Devuelve un array con los próximos N días en formato YYYY-MM-DD
 * incluyendo hoy. Se usa para validar que no pidan fechas
 * fuera del rango permitido (máximo 2 días según requisitos AIDM)
 *
 * Ejemplo: getNextDays(3) → ["2024-10-15", "2024-10-16", "2024-10-17"]
 */
function getNextDays(n = 3) {
  return Array.from({ length: n }, (_, i) =>
    toDateString(addDays(new Date(), i))
  );
}

/**
 * Calcula cuántos minutos de retraso hay entre dos horas
 * Devuelve 0 si no hay retraso o si los valores son nulos
 *
 * Ejemplo: delayMinutes("10:00", "10:25") → 25
 */
function delayMinutes(scheduledTime, estimatedTime) {
  if (!scheduledTime || !estimatedTime) return 0;
  const diff = new Date(estimatedTime) - new Date(scheduledTime);
  return Math.max(0, Math.round(diff / 60000)); // 60000ms = 1 minuto
}

module.exports = { addDays, toDateString, getNextDays, delayMinutes };
