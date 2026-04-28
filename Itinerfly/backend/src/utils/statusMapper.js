// ============================================================
// src/utils/statusMapper.js
//
// FlightAware devuelve estos campos útiles para el estado:
// - status: "Scheduled" | "En Route" | "Landed" | "Cancelled"
// - progress_percent: 0-100 (qué % del vuelo ha completado)
// - actual_out: hora real de salida (si ya salió)
// - actual_in: hora real de llegada (si ya llegó)
// - cancelled: boolean
// ============================================================

function calcularEstado(faFlight) {
  if (!faFlight) return "ON_TIME";
  
  const ahora = Date.now();
  
  // Early returns for definitive states
  if (isCancelled(faFlight)) return "CANCELLED";
  if (hasLanded(faFlight)) return "LANDED";
  if (isInFlight(faFlight)) return "IN_FLIGHT";
  
  // Status-based states
  const statusState = getStatusState(faFlight);
  if (statusState !== "UNKNOWN") return statusState;
  
  // Time-based states
  return getTimeBasedState(faFlight, ahora);
}

function isCancelled(faFlight) {
  return faFlight.cancelled || 
         (faFlight.status || "").toLowerCase().includes("cancel");
}

function hasLanded(faFlight) {
  return !!(faFlight.actual_in || faFlight.actual_on);
}

function isInFlight(faFlight) {
  if (faFlight.actual_out || faFlight.actual_off) {
    const prog = faFlight.progress_percent;
    return prog !== undefined && prog !== null && prog > 0;
  }
  return (faFlight.status || "").toLowerCase().includes("en route") ||
         (faFlight.status || "").toLowerCase().includes("airborne");
}

function getStatusState(faFlight) {
  const s = (faFlight.status || "").toLowerCase();
  if (s.includes("landed")) return "LANDED";
  if (s.includes("cancel")) return "CANCELLED";
  if (s.includes("diverted") || s.includes("delay")) return "DELAYED";
  return "UNKNOWN";
}

function getTimeBasedState(faFlight, ahora) {
  const scheduled = faFlight.scheduled_out || faFlight.scheduled_off;
  if (!scheduled) return "ON_TIME";
  
  const minutos = Math.round((new Date(scheduled) - ahora) / 60000);
  
  if (minutos < -30) return "IN_FLIGHT";
  if (minutos < 0) return "BOARDING";
  if (minutos <= 10) return "LAST_CALL";
  if (minutos <= 25) return "BOARDING";
  
  const estOut = faFlight.estimated_out || faFlight.estimated_off;
  if (estOut && faFlight.scheduled_out || faFlight.scheduled_off) {
    const delay = Math.round((new Date(estOut) - new Date(scheduled)) / 60000);
    if (delay > 0) return "DELAYED";
  }
  
  return "ON_TIME";
}

module.exports = { calcularEstado };