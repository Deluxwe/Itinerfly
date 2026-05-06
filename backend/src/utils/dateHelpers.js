/**
 * Agrega N días a una fecha
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Convierte a YYYY-MM-DD (Seguro para comparaciones locales)
 */
function toDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


function toFlightAwareTimestamp(date) {
  return Math.floor(new Date(date).getTime() / 1000);
}

/**
 * Devuelve próximos N días
 */
function getNextDays(n = 3) {
  return Array.from({ length: n }, (_, i) =>
    toDateString(addDays(new Date(), i))
  );
}

/**
 * Calcula retraso en minutos
 */
function delayMinutes(scheduledTime, estimatedTime) {
  if (!scheduledTime || !estimatedTime) return 0;
  const diff = new Date(estimatedTime) - new Date(scheduledTime);
  return Math.max(0, Math.round(diff / 60000));
}

module.exports = { 
  addDays, 
  toDateString, 
  toFlightAwareTimestamp, // Úsala antes de llamar a la API
  getNextDays, 
  delayMinutes 
};
