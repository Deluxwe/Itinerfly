const flightService = require("../services/flightAwareService");
const { success, clientError, serverError } = require("../utils/responseHelpers");
const { getNextDays } = require("../utils/dateHelpers");

// La función esFechaValida debe estar ANTES de usarse
function esFechaValida(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  return !isNaN(new Date(str));
}

async function getDepartures(req, res) {
  try {
    const { date, type, airline, search } = req.query;
    if (date && !esFechaValida(date)) {
      return clientError(res, "Formato de fecha inválido. Usa YYYY-MM-DD.", 400);
    }
    if (date && !getNextDays(3).includes(date)) {
      return clientError(res, "Fecha fuera del rango permitido (máximo 2 días).", 400);
    }
    if (type && !["domestic", "international", "all"].includes(type)) {
      return clientError(res, "Tipo inválido. Usa: domestic, international o all.", 400);
    }
    const vuelos = await flightService.getDepartures({ date, type, airlineId: airline, search });
    return success(res, { mode: "departures", count: vuelos.length, flights: vuelos });
  } catch (err) {
    console.error("[getDepartures]", err.message);
    return serverError(res, err.message);
  }
}

async function getArrivals(req, res) {
  try {
    const { date, type, airline, search } = req.query;
    if (date && !esFechaValida(date)) {
      return clientError(res, "Formato de fecha inválido. Usa YYYY-MM-DD.", 400);
    }
    if (date && !getNextDays(3).includes(date)) {
      return clientError(res, "Fecha fuera del rango permitido (máximo 2 días).", 400);
    }
    if (type && !["domestic", "international", "all"].includes(type)) {
      return clientError(res, "Tipo inválido. Usa: domestic, international o all.", 400);
    }
    const vuelos = await flightService.getArrivals({ date, type, airlineId: airline, search });
    return success(res, { mode: "arrivals", count: vuelos.length, flights: vuelos });
  } catch (err) {
    console.error("[getArrivals]", err.message);
    return serverError(res, err.message);
  }
}

async function searchByLocation(req, res) {
  try {
    const { q, mode } = req.query;
    if (!q || q.trim().length < 2) {
      return clientError(res, "La búsqueda necesita al menos 2 caracteres.", 400);
    }
    if (mode && !["departures", "arrivals"].includes(mode)) {
      return clientError(res, "Modo inválido. Usa: departures o arrivals.", 400);
    }
    const resultados = await flightService.searchByLocation(q, mode || "departures");
    return success(res, { query: q, mode: mode || "departures", count: resultados.length, flights: resultados });
  } catch (err) {
    console.error("[searchByLocation]", err.message);
    return serverError(res, err.message);
  }
}

async function getFlightDetail(req, res) {
  try {
    const codigo = req.params.flightCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (codigo.length < 3 || codigo.length > 8) {
      return clientError(res, "Código de vuelo inválido.", 400);
    }
    const vuelo = await flightService.getFlightByCode(codigo);
    if (!vuelo) return clientError(res, `Vuelo ${codigo} no encontrado.`, 404);
    return success(res, { flight: vuelo });
  } catch (err) {
    console.error("[getFlightDetail]", err.message);
    return serverError(res, err.message);
  }
}

module.exports = { getDepartures, getArrivals, searchByLocation, getFlightDetail };
