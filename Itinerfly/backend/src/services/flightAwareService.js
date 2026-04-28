const axios  = require("axios");
const config = require("../config");
const mock   = require("../mock/flightData");
const { calcularEstado } = require("../utils/statusMapper");

// ── Detectar vuelo doméstico ─────────────────────────────────
function esDomestico(origin, destination) {
  if (origin?.country_code && destination?.country_code) {
    return origin.country_code === "US" && destination.country_code === "US";
  }
  const esUSA = (icao) => {
    if (!icao) return false;
    const c = icao.toUpperCase();
    return c.startsWith("K") || c.startsWith("PA") || c.startsWith("PH") || c.startsWith("TJ");
  };
  return esUSA(origin?.icao || origin?.code) && esUSA(destination?.icao || destination?.code);
}

// ── Cliente HTTP ─────────────────────────────────────────────
const faClient = axios.create({
  baseURL: config.flightAware.baseUrl,
  timeout: 15000,
  headers: { "x-apikey": config.flightAware.apiKey, "Accept": "application/json" },
});

faClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err.response?.status;
    const m = err.response?.data?.detail || err.message;
    if (s === 401) throw new Error("FlightAware: API Key inválida.");
    if (s === 403) throw new Error("FlightAware: Sin permiso.");
    if (s === 429) throw new Error("FlightAware: Límite de peticiones alcanzado.");
    throw new Error(`FlightAware error ${s}: ${m}`);
  }
);

// ── Normalización ────────────────────────────────────────────
function normalizarVuelo(f) {
  const orig = f.origin      || {};
  const dest = f.destination || {};

  const schedOut = f.scheduled_out || f.scheduled_off;
  const estOut   = f.estimated_out || f.estimated_off || schedOut;
  const schedIn  = f.scheduled_in  || f.scheduled_on;
  const estIn    = f.estimated_in  || f.estimated_on  || schedIn;

  const originNorm = {
    iata:         orig.code_iata    || orig.code || "",
    icao:         orig.code         || "",
    city:         orig.city         || "",
    country:      orig.country      || "",
    country_code: orig.country_code || "",
  };
  const destNorm = {
    iata:         dest.code_iata    || dest.code || "",
    icao:         dest.code         || "",
    city:         dest.city         || "",
    country:      dest.country      || "",
    country_code: dest.country_code || "",
  };

  const delay = schedOut && estOut
    ? Math.max(0, Math.round((new Date(estOut) - new Date(schedOut)) / 60000))
    : 0;

  return {
    flightNumber:     f.ident_iata    || f.ident,
    airlineId:        f.operator_iata || (f.ident || "").slice(0, 2),
    origin:           originNorm,
    destination:      destNorm,
    scheduledOut:     schedOut,
    estimatedOut:     estOut,
    actualOut:        f.actual_out  || f.actual_off  || null,
    scheduledIn:      schedIn,
    estimatedIn:      estIn,
    actualIn:         f.actual_in   || f.actual_on   || null,
    // Pasar el objeto completo al mapper para decisión correcta
    status:           calcularEstado(f),
    gate:             f.gate_origin || f.gate_destination || "—",
    terminal:         f.terminal_origin || f.terminal_destination || "—",
    aircraft:         f.aircraft_type || "—",
    type:             esDomestico(originNorm, destNorm) ? "domestic" : "international",
    delayMinutes:     delay,
    registration:     f.registration || "—",
    callsign:         f.ident        || "—",
    cruiseAltitudeFt: f.filed_altitude,
    cruiseSpeedKts:   f.filed_speed,
    progressPercent:  f.progress_percent,
  };
}

// ── Rango de fechas para FlightAware ─────────────────────────
function construirRango(date) {
const ahora = new Date();
  const ahoraUTC = Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate(),
    ahora.getUTCHours(),
    ahora.getUTCMinutes(),
    ahora.getUTCSeconds()
  );

  if (!date) {
    // Sin fecha: 6h atrás a 18h adelante (en UTC)
    return {
      start: new Date(ahoraUTC - 6 * 3600000).toISOString(),
      end:   new Date(ahoraUTC + 18 * 3600000).toISOString(),
    };
  }


  const [y, m, d] = date.split("-").map(Number);
  const inicioUTC = Date.UTC(y, m - 1, d, 0, 0, 0);
  const finUTC = Date.UTC(y, m - 1, d, 23, 59, 59);

  const maxFinUTC = ahoraUTC + 47 * 3600000;
  const minInicioUTC = ahoraUTC - 24 * 3600000;

  return {
    start: new Date(Math.max(inicioUTC, minInicioUTC)).toISOString(),
    end:   new Date(Math.min(finUTC, maxFinUTC)).toISOString(),
  };
}

// ── Fecha local ───────────────────────────────────────────────
function fechaLocal(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── Filtrado ──────────────────────────────────────────────────
function filtrar(vuelos, opciones, mode) {
  const { date, type, airlineId, search, locationSearch } = opciones;
  const hoy = new Date();
  const fechasValidas = [0,1,2].map(n => {
    const d = new Date(hoy); d.setDate(hoy.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });

  return vuelos.filter(f => {
    const fv = fechaLocal(mode==="departures" ? f.scheduledOut : (f.scheduledIn||f.scheduledOut));
    if (!fv || !fechasValidas.includes(fv)) return false;
    if (date && fv !== date) return false;
    if (type && type !== "all" && f.type !== type) return false;
    if (airlineId && airlineId !== "all" && f.airlineId !== airlineId) return false;
    if (search && !f.flightNumber?.toUpperCase().includes(search.toUpperCase())) return false;
    if (locationSearch) {
      const q   = locationSearch.toLowerCase().trim();
      const loc = mode==="departures" ? f.destination : f.origin;
      if (!loc?.city?.toLowerCase().includes(q) &&
          !loc?.country?.toLowerCase().includes(q) &&
          !loc?.iata?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ── API Pública ───────────────────────────────────────────────
async function getDepartures(opciones = {}) {
  if (config.useMockData) return filtrar(mock.DEPARTURES, opciones, "departures");
  const { start, end } = construirRango(opciones.date);
  const r = await faClient.get(
    `/airports/${config.airport.icao}/flights/departures`,
    { params: { max_pages: 2, type: "Airline", start, end } }
  );
  return filtrar((r.data.departures||[]).map(normalizarVuelo), opciones, "departures");
}

async function getArrivals(opciones = {}) {
  if (config.useMockData) return filtrar(mock.ARRIVALS, opciones, "arrivals");
  const { start, end } = construirRango(opciones.date);
  const r = await faClient.get(
    `/airports/${config.airport.icao}/flights/arrivals`,
    { params: { max_pages: 2, type: "Airline", start, end } }
  );
  return filtrar((r.data.arrivals||[]).map(normalizarVuelo), opciones, "arrivals");
}

async function getFlightByCode(codigo) {
  if (config.useMockData) {
    return [...mock.DEPARTURES,...mock.ARRIVALS]
      .find(f => f.flightNumber?.toUpperCase()===codigo.toUpperCase()) || null;
  }
  const r = await faClient.get(`/flights/${codigo}`);
  const vuelos = r.data.flights || [];
  if (!vuelos.length) return null;
  return normalizarVuelo(vuelos[0]);
}

async function getAirlines() {
  if (config.useMockData) return mock.AIRLINES;
  try {
    const r   = await faClient.get(`/airports/${config.airport.icao}/operators`);
    const ops = (r.data.operators||[])
      .filter(op => op.iata_designator && op.name)
      .map(op => ({
        id: op.iata_designator, name: op.name,
        iata: op.iata_designator, icao: op.icao||"",
        phone:"—", terminalDep:"—", terminalArr:"—",
      }));
    return ops.length > 0 ? ops : mock.AIRLINES;
  } catch { return mock.AIRLINES; }
}

async function getRoutes() { return mock.ROUTES; }

async function searchByLocation(query, mode="departures") {
  const src = mode==="departures" ? mock.DEPARTURES : mock.ARRIVALS;
  const q   = query.toLowerCase().trim();
  return src.filter(f => {
    const loc = mode==="departures" ? f.destination : f.origin;
    return loc?.city?.toLowerCase().includes(q) ||
           loc?.country?.toLowerCase().includes(q) ||
           loc?.iata?.toLowerCase().includes(q);
  });
}

module.exports = { getDepartures, getArrivals, getFlightByCode, getAirlines, getRoutes, searchByLocation };
module.exports.esDomestico = esDomestico;
module.exports.normalizarVuelo = normalizarVuelo;
module.exports.construirRango = construirRango;
module.exports.fechaLocal = fechaLocal;
module.exports.filtrar = filtrar;