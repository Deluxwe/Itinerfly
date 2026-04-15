// ============================================================
// src/mock/flightData.js
//
// Datos de prueba que imitan exactamente lo que devolvería
// FlightAware AeroAPI v4 cuando USE_MOCK_DATA=true.
//
// Cuando tengas la API Key real, el servicio flightAwareService.js
// usará estos mismos datos como respaldo si la API falla,
// o los ignorará completamente si todo va bien.
//
// Los campos siguen la nomenclatura oficial de FlightAware:
// https://www.flightaware.com/commercial/aeroapi/documentation
// ============================================================

const { addDays } = require("../utils/dateHelpers");

const hoy = new Date();

// Función para construir fechas fácilmente
// daysOffset = días desde hoy (0=hoy, 1=mañana, 2=pasado)
// h = hora, m = minutos
function dt(daysOffset, h, m) {
  const d = addDays(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()), daysOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// ── Aerolíneas ───────────────────────────────────────────────
const AIRLINES = [
  { id: "AA", name: "American Airlines", iata: "AA", icao: "AAL", phone: "+1 800-433-7300", terminalDep: "Terminal 8", terminalArr: "Terminal 8" },
  { id: "DL", name: "Delta Air Lines",   iata: "DL", icao: "DAL", phone: "+1 800-221-1212", terminalDep: "Terminal 4", terminalArr: "Terminal 4" },
  { id: "UA", name: "United Airlines",   iata: "UA", icao: "UAL", phone: "+1 800-864-8331", terminalDep: "Terminal 7", terminalArr: "Terminal 7" },
  { id: "B6", name: "JetBlue Airways",   iata: "B6", icao: "JBU", phone: "+1 800-538-2583", terminalDep: "Terminal 5", terminalArr: "Terminal 5" },
  { id: "BA", name: "British Airways",   iata: "BA", icao: "BAW", phone: "+1 800-247-9297", terminalDep: "Terminal 7", terminalArr: "Terminal 7" },
  { id: "LH", name: "Lufthansa",         iata: "LH", icao: "DLH", phone: "+1 800-645-3880", terminalDep: "Terminal 1", terminalArr: "Terminal 1" },
];

// ── Rutas disponibles desde JFK ──────────────────────────────
const ROUTES = [
  { id: "JFK-LHR", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "LHR", name: "London Heathrow Airport",          city: "Londres",     lat: 51.477,  lng: -0.4613  }, airlineId: "BA", distanceKm: 5570,  durationMin: 425 },
  { id: "JFK-CDG", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "CDG", name: "Charles de Gaulle Airport",        city: "París",       lat: 49.0097, lng: 2.5478   }, airlineId: "DL", distanceKm: 5837,  durationMin: 440 },
  { id: "JFK-FRA", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "FRA", name: "Frankfurt Airport",                city: "Frankfurt",   lat: 50.0379, lng: 8.5622   }, airlineId: "LH", distanceKm: 6207,  durationMin: 480 },
  { id: "JFK-NRT", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "NRT", name: "Narita International Airport",     city: "Tokio",       lat: 35.7647, lng: 140.3864 }, airlineId: "UA", distanceKm: 10838, durationMin: 850 },
  { id: "JFK-LAX", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "LAX", name: "Los Angeles International Airport",city: "Los Angeles", lat: 33.9425, lng: -118.408 }, airlineId: "AA", distanceKm: 3983,  durationMin: 330 },
  { id: "JFK-ATL", from: { iata: "JFK", name: "John F. Kennedy International", city: "New York",    lat: 40.6413, lng: -73.7781 }, to: { iata: "ATL", name: "Hartsfield-Jackson Atlanta Intl", city: "Atlanta",     lat: 33.6407, lng: -84.4277 }, airlineId: "DL", distanceKm: 1228,  durationMin: 140 },
];

// ── Vuelos de salida ─────────────────────────────────────────
const DEPARTURES = [
  { flightNumber: "AA101", airlineId: "AA", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "LAX", city: "Los Angeles", country: "USA"          }, scheduledOut: dt(0,6,30),  estimatedOut: dt(0,6,30),  actualOut: dt(0,6,28), scheduledIn: dt(0,12,0),  estimatedIn: dt(0,12,0),  actualIn: dt(0,11,55), status: "LANDED",    gate: "B22", terminal: "Terminal 8", aircraft: "Boeing 737-800",      type: "domestic",      delayMinutes: 0,  registration: "N123AA", callsign: "AAL101", cruiseAltitudeFt: 35000, cruiseSpeedKts: 460 },
  { flightNumber: "DL405", airlineId: "DL", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "ATL", city: "Atlanta",     country: "USA"          }, scheduledOut: dt(0,8,0),   estimatedOut: dt(0,8,25),  actualOut: null,       scheduledIn: dt(0,10,20), estimatedIn: dt(0,10,45), actualIn: null,        status: "DELAYED",   gate: "C14", terminal: "Terminal 4", aircraft: "Airbus A320",         type: "domestic",      delayMinutes: 25, registration: "N456DL", callsign: "DAL405", cruiseAltitudeFt: 33000, cruiseSpeedKts: 440 },
  { flightNumber: "BA178", airlineId: "BA", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "LHR", city: "Londres",     country: "Reino Unido"  }, scheduledOut: dt(0,9,45),  estimatedOut: dt(0,9,45),  actualOut: null,       scheduledIn: dt(0,21,50), estimatedIn: dt(0,21,50), actualIn: null,        status: "BOARDING",  gate: "A7",  terminal: "Terminal 7", aircraft: "Boeing 777-300ER",    type: "international", delayMinutes: 0,  registration: "G-STBA", callsign: "BAW178", cruiseAltitudeFt: 38000, cruiseSpeedKts: 490 },
  { flightNumber: "LH401", airlineId: "LH", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "FRA", city: "Frankfurt",   country: "Alemania"     }, scheduledOut: dt(0,10,30), estimatedOut: dt(0,10,30), actualOut: null,       scheduledIn: dt(1,0,30),  estimatedIn: dt(1,0,30),  actualIn: null,        status: "LAST_CALL", gate: "D3",  terminal: "Terminal 1", aircraft: "Airbus A340-600",     type: "international", delayMinutes: 0,  registration: "D-AIHY", callsign: "DLH401", cruiseAltitudeFt: 39000, cruiseSpeedKts: 480 },
  { flightNumber: "B6912", airlineId: "B6", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "MCO", city: "Orlando",     country: "USA"          }, scheduledOut: dt(0,12,15), estimatedOut: dt(0,12,15), actualOut: null,       scheduledIn: dt(0,15,10), estimatedIn: dt(0,15,10), actualIn: null,        status: "ON_TIME",   gate: "E18", terminal: "Terminal 5", aircraft: "Airbus A321",         type: "domestic",      delayMinutes: 0,  registration: "N923JB", callsign: "JBU912", cruiseAltitudeFt: 34000, cruiseSpeedKts: 445 },
  { flightNumber: "UA88",  airlineId: "UA", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "NRT", city: "Tokio",       country: "Japón"        }, scheduledOut: dt(0,13,0),  estimatedOut: dt(0,13,0),  actualOut: dt(0,13,5), scheduledIn: dt(1,16,10), estimatedIn: dt(1,16,10), actualIn: null,        status: "IN_FLIGHT", gate: "F5",  terminal: "Terminal 7", aircraft: "Boeing 787-9",        type: "international", delayMinutes: 0,  registration: "N29971", callsign: "UAL88",  cruiseAltitudeFt: 41000, cruiseSpeedKts: 500 },
  { flightNumber: "AA202", airlineId: "AA", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "ORD", city: "Chicago",     country: "USA"          }, scheduledOut: dt(0,15,45), estimatedOut: dt(0,16,50), actualOut: null,       scheduledIn: dt(0,17,30), estimatedIn: dt(0,18,35), actualIn: null,        status: "DELAYED",   gate: "B9",  terminal: "Terminal 8", aircraft: "Boeing 737 MAX 8",    type: "domestic",      delayMinutes: 65, registration: "N788AA", callsign: "AAL202", cruiseAltitudeFt: 35000, cruiseSpeedKts: 455 },
  { flightNumber: "DL520", airlineId: "DL", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "CDG", city: "París",       country: "Francia"      }, scheduledOut: dt(0,17,20), estimatedOut: dt(0,17,20), actualOut: null,       scheduledIn: dt(1,7,40),  estimatedIn: dt(1,7,40),  actualIn: null,        status: "CANCELLED", gate: "C22", terminal: "Terminal 4", aircraft: "Airbus A350-900",     type: "international", delayMinutes: 0,  registration: "N516DN", callsign: "DAL520", cruiseAltitudeFt: 40000, cruiseSpeedKts: 488 },
  { flightNumber: "B6340", airlineId: "B6", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "BOS", city: "Boston",      country: "USA"          }, scheduledOut: dt(1,7,10),  estimatedOut: dt(1,7,10),  actualOut: null,       scheduledIn: dt(1,8,15),  estimatedIn: dt(1,8,15),  actualIn: null,        status: "ON_TIME",   gate: "E4",  terminal: "Terminal 5", aircraft: "Embraer E190",        type: "domestic",      delayMinutes: 0,  registration: "N281JB", callsign: "JBU340", cruiseAltitudeFt: 28000, cruiseSpeedKts: 410 },
  { flightNumber: "LH402", airlineId: "LH", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "MUC", city: "Múnich",      country: "Alemania"     }, scheduledOut: dt(1,9,0),   estimatedOut: dt(1,9,0),   actualOut: null,       scheduledIn: dt(1,22,55), estimatedIn: dt(1,22,55), actualIn: null,        status: "ON_TIME",   gate: "D8",  terminal: "Terminal 1", aircraft: "Airbus A380-800",     type: "international", delayMinutes: 0,  registration: "D-AIML", callsign: "DLH402", cruiseAltitudeFt: 38000, cruiseSpeedKts: 485 },
  { flightNumber: "UA305", airlineId: "UA", origin: { iata: "JFK", city: "New York",    country: "USA"          }, destination: { iata: "SFO", city: "San Francisco",country: "USA"         }, scheduledOut: dt(2,11,30), estimatedOut: dt(2,11,30), actualOut: null,       scheduledIn: dt(2,15,15), estimatedIn: dt(2,15,15), actualIn: null,        status: "ON_TIME",   gate: "F12", terminal: "Terminal 7", aircraft: "Boeing 757-200",      type: "domestic",      delayMinutes: 0,  registration: "N19141", callsign: "UAL305", cruiseAltitudeFt: 37000, cruiseSpeedKts: 460 },
];

// ── Vuelos de llegada ────────────────────────────────────────
const ARRIVALS = [
  { flightNumber: "AA102", airlineId: "AA", origin: { iata: "LAX", city: "Los Angeles", country: "USA"          }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,1,15),  estimatedOut: dt(0,1,15),  actualOut: dt(0,1,18),  scheduledIn: dt(0,7,45),  estimatedIn: dt(0,7,45),  actualIn: dt(0,7,38),  status: "LANDED",    gate: "B11", terminal: "Terminal 8", aircraft: "Boeing 737-800",   type: "domestic",      delayMinutes: 0,  registration: "N124AA", callsign: "AAL102", cruiseAltitudeFt: 35000, cruiseSpeedKts: 458 },
  { flightNumber: "BA179", airlineId: "BA", origin: { iata: "LHR", city: "Londres",     country: "Reino Unido"  }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,1,30),  estimatedOut: dt(0,1,30),  actualOut: dt(0,1,35),  scheduledIn: dt(0,9,20),  estimatedIn: dt(0,9,55),  actualIn: null,        status: "DELAYED",   gate: "A3",  terminal: "Terminal 7", aircraft: "Boeing 777-200ER", type: "international", delayMinutes: 35, registration: "G-VIID", callsign: "BAW179", cruiseAltitudeFt: 37000, cruiseSpeedKts: 485 },
  { flightNumber: "DL406", airlineId: "DL", origin: { iata: "ATL", city: "Atlanta",     country: "USA"          }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,9,5),   estimatedOut: dt(0,9,5),   actualOut: dt(0,9,10),  scheduledIn: dt(0,11,10), estimatedIn: dt(0,11,10), actualIn: null,        status: "IN_FLIGHT", gate: "C7",  terminal: "Terminal 4", aircraft: "Airbus A321",      type: "domestic",      delayMinutes: 0,  registration: "N301DQ", callsign: "DAL406", cruiseAltitudeFt: 33000, cruiseSpeedKts: 442 },
  { flightNumber: "LH400", airlineId: "LH", origin: { iata: "FRA", city: "Frankfurt",   country: "Alemania"     }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,6,30),  estimatedOut: dt(0,6,30),  actualOut: dt(0,6,28),  scheduledIn: dt(0,14,30), estimatedIn: dt(0,14,30), actualIn: null,        status: "ON_TIME",   gate: "D2",  terminal: "Terminal 1", aircraft: "Airbus A340-600",  type: "international", delayMinutes: 0,  registration: "D-AIHW", callsign: "DLH400", cruiseAltitudeFt: 39000, cruiseSpeedKts: 480 },
  { flightNumber: "B6913", airlineId: "B6", origin: { iata: "MCO", city: "Orlando",     country: "USA"          }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,13,0),  estimatedOut: dt(0,13,0),  actualOut: dt(0,13,5),  scheduledIn: dt(0,16,0),  estimatedIn: dt(0,16,0),  actualIn: null,        status: "ON_TIME",   gate: "E21", terminal: "Terminal 5", aircraft: "Airbus A320",      type: "domestic",      delayMinutes: 0,  registration: "N535JB", callsign: "JBU913", cruiseAltitudeFt: 34000, cruiseSpeedKts: 440 },
  { flightNumber: "UA89",  airlineId: "UA", origin: { iata: "NRT", city: "Tokio",       country: "Japón"        }, destination: { iata: "JFK", city: "New York", country: "USA" }, scheduledOut: dt(0,11,5),  estimatedOut: dt(0,11,5),  actualOut: dt(0,11,10), scheduledIn: dt(1,10,15), estimatedIn: dt(1,10,15), actualIn: null,        status: "ON_TIME",   gate: "F9",  terminal: "Terminal 7", aircraft: "Boeing 787-9",     type: "international", delayMinutes: 0,  registration: "N29972", callsign: "UAL89",  cruiseAltitudeFt: 41000, cruiseSpeedKts: 498 },
];

module.exports = { AIRLINES, ROUTES, DEPARTURES, ARRIVALS };
