// ============================================================
// src/services/flightAwareService.js
//
// Este es el archivo más importante del backend.
// Aquí está el INTERRUPTOR entre datos mock y datos reales.
//
// Flujo cuando USE_MOCK_DATA=true (sin API key):
//   Frontend → Controller → Este servicio → Devuelve mock
//
// Flujo cuando USE_MOCK_DATA=false (con API key):
//   Frontend → Controller → Este servicio → FlightAware API → Devuelve datos reales
//
// La ventaja de este diseño: los controladores no saben
// ni les importa si los datos son reales o falsos.
// Solo llaman a este servicio y reciben la misma estructura.
// ============================================================

const axios  = require("axios");
const config = require("../config");
const mock   = require("../mock/flightData");
const { toDateString, getNextDays, delayMinutes } = require("../utils/dateHelpers");

// ── Cliente HTTP configurado para FlightAware ────────────────
// Se crea una sola vez y se reutiliza en todas las peticiones.
// Lleva la API Key en el header automáticamente.
const flightAwareClient = axios.create({
  baseURL: config.flightAware.baseUrl,
  timeout: 10000, // Si FlightAware no responde en 10s, cancela la petición
  headers: {
    "x-apikey": config.flightAware.apiKey, // Así pide FlightAware la autenticación
    "Accept":   "application/json",
  },
});

// ── Manejo de errores de FlightAware ─────────────────────────
// Intercepta todos los errores HTTP y los convierte en
// mensajes legibles en vez de errores técnicos crípticos
flightAwareClient.interceptors.response.use(
  (response) => response, // Si va bien, devuelve la respuesta sin cambios
  (error) => {
    const status  = error.response?.status;
    const mensaje = error.response?.data?.detail || error.message;

    // Cada código HTTP tiene su significado
    if (status === 401) throw new Error("FlightAware: API Key inválida. Revisa el .env");
    if (status === 403) throw new Error("FlightAware: Sin permiso. Verifica tu plan de suscripción");
    if (status === 429) throw new Error("FlightAware: Límite de peticiones alcanzado. Espera un momento");
    if (status === 503) throw new Error("FlightAware: Servicio caído temporalmente");

    throw new Error(`FlightAware error ${status}: ${mensaje}`);
  }
);

// ============================================================
// ── FUNCIONES PÚBLICAS DEL SERVICIO ─────────────────────────
// Estas son las funciones que llaman los controladores.
// Cada una tiene dos versiones: mock y real.
// ============================================================

/**
 * Obtiene vuelos de SALIDA del aeropuerto JFK
 *
 * @param {object} opciones
 *   - date     : "YYYY-MM-DD" — filtrar por fecha específica
 *   - type     : "domestic" | "international" | "all"
 *   - airlineId: "AA" | "DL" | etc — filtrar por aerolínea
 *   - search   : texto libre para buscar por número de vuelo
 */
async function getDepartures(opciones = {}) {

  // ── MODO MOCK ─────────────────────────────────────────
  if (config.useMockData) {
    // Simplemente filtra los datos del archivo mock
    return filtrarVuelos(mock.DEPARTURES, opciones, "departures");
  }

  // ── MODO REAL (FlightAware AeroAPI v4) ────────────────
  // Endpoint oficial: GET /airports/{id}/flights/departures
  // Documentación: https://www.flightaware.com/commercial/aeroapi/documentation
  const respuesta = await flightAwareClient.get(
    `/airports/${config.airport.icao}/flights/departures`,
    {
      params: {
        max_pages: 1,  // Solo la primera página de resultados
        type: "Airline", // Solo vuelos comerciales (no privados)
        // Si hay fecha, filtra ese día. Si no, trae los de hoy
        start: opciones.date ? `${opciones.date}T00:00:00Z` : undefined,
        end:   opciones.date ? `${opciones.date}T23:59:59Z` : undefined,
      }
    }
  );

  // FlightAware devuelve { departures: [...] }
  // Normalizamos cada vuelo al mismo formato que usa el mock
  const vuelos = (respuesta.data.departures || []).map(vuelo =>
    normalizarVueloFlightAware(vuelo, "departures")
  );

  return filtrarVuelos(vuelos, opciones, "departures");
}

/**
 * Obtiene vuelos de LLEGADA al aeropuerto JFK
 * Misma lógica que getDepartures pero para llegadas
 */
async function getArrivals(opciones = {}) {

  if (config.useMockData) {
    return filtrarVuelos(mock.ARRIVALS, opciones, "arrivals");
  }

  // Endpoint oficial: GET /airports/{id}/flights/arrivals
  const respuesta = await flightAwareClient.get(
    `/airports/${config.airport.icao}/flights/arrivals`,
    {
      params: {
        max_pages: 1,
        type: "Airline",
        start: opciones.date ? `${opciones.date}T00:00:00Z` : undefined,
        end:   opciones.date ? `${opciones.date}T23:59:59Z` : undefined,
      }
    }
  );

  const vuelos = (respuesta.data.arrivals || []).map(vuelo =>
    normalizarVueloFlightAware(vuelo, "arrivals")
  );

  return filtrarVuelos(vuelos, opciones, "arrivals");
}

/**
 * Busca un vuelo específico por su código IATA
 * Ejemplo: getFlightByCode("AA101")
 */
async function getFlightByCode(codigoVuelo) {

  if (config.useMockData) {
    // Busca en ambas listas (salidas y llegadas)
    const todos = [...mock.DEPARTURES, ...mock.ARRIVALS];
    return todos.find(
      f => f.flightNumber.toUpperCase() === codigoVuelo.toUpperCase()
    ) || null; // null si no lo encuentra
  }

  // Endpoint oficial: GET /flights/{ident}
  // Devuelve historial del vuelo, tomamos el más reciente
  const respuesta = await flightAwareClient.get(`/flights/${codigoVuelo}`);
  const vuelos = respuesta.data.flights || [];

  if (vuelos.length === 0) return null;

  return normalizarVueloFlightAware(vuelos[0], "departures");
}

/**
 * Obtiene la lista de aerolíneas que operan en JFK
 */
async function getAirlines() {

  if (config.useMockData) {
    return mock.AIRLINES;
  }

  // Endpoint oficial: GET /airports/{id}/operators
  const respuesta = await flightAwareClient.get(
    `/airports/${config.airport.icao}/operators`
  );

  return (respuesta.data.operators || []).map(op => ({
    id:          op.iata_designator || op.icao,
    name:        op.name,
    iata:        op.iata_designator,
    icao:        op.icao,
    phone:       "—", // FlightAware no provee teléfono, enriquecer con otra fuente
    terminalDep: "—",
    terminalArr: "—",
  }));
}

/**
 * Obtiene las rutas disponibles desde JFK
 * (Estático por ahora — FlightAware no tiene un endpoint de rutas)
 */
async function getRoutes() {
  return mock.ROUTES;
}

/**
 * Busca vuelos por ciudad, país o código de aeropuerto
 * Ejemplo: searchByLocation("London", "departures")
 */
async function searchByLocation(query, mode = "departures") {
  const vuelos = mode === "departures" ? mock.DEPARTURES : mock.ARRIVALS;
  const q = query.toLowerCase().trim();

  return vuelos.filter(f => {
    // En salidas buscamos en el destino; en llegadas en el origen
    const lugar = mode === "departures" ? f.destination : f.origin;
    return (
      lugar.city?.toLowerCase().includes(q)    ||
      lugar.country?.toLowerCase().includes(q) ||
      lugar.iata?.toLowerCase().includes(q)
    );
  });
}

// ============================================================
// ── FUNCIONES PRIVADAS (solo uso interno) ───────────────────
// ============================================================

/**
 * Convierte un vuelo del formato FlightAware al formato interno
 *
 * FlightAware usa nombres en inglés como "scheduled_out", "origin", etc.
 * Nosotros usamos nuestra propia estructura.
 * Esta función hace la traducción.
 */
function normalizarVueloFlightAware(vuelo, mode) {
  return {
    flightNumber:     vuelo.ident_iata || vuelo.ident,
    airlineId:        vuelo.operator_iata || vuelo.ident?.slice(0, 2),
    origin: {
      iata:    vuelo.origin?.code_iata,
      city:    vuelo.origin?.city,
      country: vuelo.origin?.country_code,
    },
    destination: {
      iata:    vuelo.destination?.code_iata,
      city:    vuelo.destination?.city,
      country: vuelo.destination?.country_code,
    },
    scheduledOut:     vuelo.scheduled_out,
    estimatedOut:     vuelo.estimated_out,
    actualOut:        vuelo.actual_out,
    scheduledIn:      vuelo.scheduled_in,
    estimatedIn:      vuelo.estimated_in,
    actualIn:         vuelo.actual_in,
    status:           traducirEstadoFlightAware(vuelo.status, vuelo.cancelled),
    gate:             vuelo.gate_origin || vuelo.gate_destination || "—",
    terminal:         vuelo.terminal_origin || vuelo.terminal_destination || "—",
    aircraft:         vuelo.aircraft_type || "—",
    type:             "domestic", // TODO: calcular según países de origen/destino
    delayMinutes:     delayMinutes(vuelo.scheduled_out, vuelo.estimated_out),
    registration:     vuelo.registration,
    callsign:         vuelo.ident,
    cruiseAltitudeFt: vuelo.filed_altitude,
    cruiseSpeedKts:   vuelo.filed_speed,
  };
}

/**
 * Traduce los estados de FlightAware a los 8 estados IATA AIDM
 *
 * FlightAware usa: "Scheduled", "En Route", "Landed", "Cancelled"
 * Nosotros usamos: ON_TIME, IN_FLIGHT, LANDED, CANCELLED, etc.
 */
function traducirEstadoFlightAware(estado, cancelado) {
  if (cancelado) return "CANCELLED";

  const mapa = {
    "Scheduled": "ON_TIME",
    "En Route":  "IN_FLIGHT",
    "Landed":    "LANDED",
    "Cancelled": "CANCELLED",
    "Diverted":  "DELAYED",
  };

  // BOARDING y LAST_CALL no vienen de FlightAware directamente.
  // Se derivan del tiempo restante antes de la salida programada.
  // TODO: implementar lógica de tiempo cuando tengamos datos reales

  return mapa[estado] || "ON_TIME";
}

/**
 * Filtra una lista de vuelos según las opciones del usuario
 * Se usa tanto con datos mock como con datos reales
 */
function filtrarVuelos(vuelos, opciones, mode) {
  const { date, type, airlineId, search } = opciones;

  // Fechas válidas: hoy + 2 días siguientes (requisito AIDM)
  const fechasValidas = getNextDays(3);

  return vuelos.filter(vuelo => {
    // Determinar la fecha del vuelo según si es salida o llegada
    const fechaVuelo = toDateString(
      mode === "departures" ? vuelo.scheduledOut : vuelo.scheduledIn
    );

    // Solo mostrar vuelos dentro del rango permitido
    if (!fechasValidas.includes(fechaVuelo)) return false;

    // Filtro por fecha específica
    if (date && fechaVuelo !== date) return false;

    // Filtro por tipo (nacional / internacional)
    if (type && type !== "all" && vuelo.type !== type) return false;

    // Filtro por aerolínea
    if (airlineId && airlineId !== "all" && vuelo.airlineId !== airlineId) return false;

    // Búsqueda por número de vuelo
    if (search) {
      const q = search.toUpperCase();
      if (!vuelo.flightNumber?.toUpperCase().includes(q)) return false;
    }

    return true; // Pasó todos los filtros
  });
}

// Exportamos solo las funciones públicas
module.exports = {
  getDepartures,
  getArrivals,
  getFlightByCode,
  getAirlines,
  getRoutes,
  searchByLocation,
};
