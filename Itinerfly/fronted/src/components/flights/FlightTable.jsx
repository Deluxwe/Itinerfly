// ============================================================
// FlightTable.jsx
//
// Ahora los filtros los maneja HomePage (el componente padre)
// y los pasa hacia abajo. Así cuando cambian los filtros,
// HomePage le avisa al hook useFlights para pedir nuevos datos.
// ============================================================

import React from "react";
import { AIRLINES } from "../../data/mockData";
import FlightStatusBadge from "./FlightStatusBadge";
import FlightFilters from "./FlightFilters";

const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
  : "—";

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
  : "—";

export default function FlightTable({ flights, onFlightClick, mode, filtros, onFiltrosChange }) {

  // Mapa de aerolíneas para acceso rápido por ID
  const airlineMap = Object.fromEntries(AIRLINES.map(a => [a.id, a]));

  return (
    <div>
      {/* Búsqueda por número de vuelo */}
      <div className="search-row">
        <div className="flight-search-wrap">
          <span className="flight-search-icon">✈</span>
          <input
            className="flight-search-input"
            type="text"
            placeholder="Número de vuelo (ej: AA101)"
            value={filtros.search || ""}
            onChange={(e) => onFiltrosChange({ ...filtros, search: e.target.value })}
          />
        </div>
        {filtros.search && (
          <button
            className="clear-btn"
            onClick={() => onFiltrosChange({ ...filtros, search: "" })}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros de fecha, tipo, aerolínea y ubicación */}
      <FlightFilters filters={filtros} onChange={onFiltrosChange} />

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table className="flights-table">
          <thead>
            <tr>
              {["Vuelo", "Aerolínea", mode === "departures" ? "Destino" : "Origen",
                "Programado", "Estimado", "Puerta", "Terminal", "Estado"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty">
                  No se encontraron vuelos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              flights.map((f, i) => {
                const airline = airlineMap[f.airlineId || f.airline];
                const loc     = mode === "departures" ? f.destination : f.origin;
                return (
                  <tr
                    key={f.flightNumber + i}
                    className={`flight-row ${i % 2 === 0 ? "even" : "odd"}`}
                    onClick={() => onFlightClick && onFlightClick(f)}
                  >
                    <td><span className="flight-number">{f.flightNumber}</span></td>
                    <td><span className="airline-name">{airline?.name || f.airlineId || f.airline}</span></td>
                    <td>
                      <div className="flight-iata">{loc?.iata}</div>
                      <div className="flight-city">{loc?.city}, {loc?.country}</div>
                    </td>
                    <td>
                      <div className="flight-time">{fmtTime(f.scheduledOut)}</div>
                      <div className="flight-date">{fmtDate(f.scheduledOut)}</div>
                    </td>
                    <td>
                      <div className={`flight-time${f.delayMinutes > 0 ? " delayed" : ""}`}>
                        {fmtTime(f.estimatedOut)}
                      </div>
                      {f.delayMinutes > 0 && (
                        <div className="flight-delay">+{f.delayMinutes} min</div>
                      )}
                    </td>
                    <td><span className="gate-badge">{f.gate}</span></td>
                    <td><span className="terminal-text">{f.terminal}</span></td>
                    <td><FlightStatusBadge status={f.status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-count">
        Mostrando {flights.length} vuelos
      </div>
    </div>
  );
}
