import React from "react";
import FlightStatusBadge from "./FlightStatusBadge";
import FlightFilters from "./FlightFilters";

const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:false})
  : "—";
const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})
  : "—";

export default function FlightTable({
  flights, onFlightClick, mode,
  filtros, airlines, airlineMap, onFiltrosChange,
  searchInput, locationInput, onSearchChange, onLocationChange,
}) {
  return (
    <div>
      <div className="search-row">
        <div className="flight-search-wrap">
          <span className="flight-search-icon">✈</span>
          <input
            className="flight-search-input"
            type="text"
            placeholder="Número de vuelo (ej: AA101)"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {searchInput && (
          <button className="clear-btn" onClick={() => onSearchChange("")}>Limpiar</button>
        )}
      </div>

      <FlightFilters
        filters={filtros}
        airlines={airlines}
        locationInput={locationInput}
        onChange={onFiltrosChange}
        onLocationChange={onLocationChange}
      />

      <div style={{overflowX:"auto"}}>
        <table className="flights-table">
          <thead>
            <tr>
              {["Vuelo","Aerolínea",
                mode==="departures"?"Destino":"Origen",
                "Programado","Estimado","Puerta","Terminal","Estado"
              ].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {flights.length===0 ? (
              <tr><td colSpan={8} className="table-empty">
                No se encontraron vuelos con los filtros seleccionados.
              </td></tr>
            ) : flights.map((f,i) => {
              const loc     = mode==="departures" ? f.destination : f.origin;
              // Buscar nombre completo de la aerolínea en el mapa
              const alNombre = airlineMap?.[f.airlineId] || f.airlineId || f.airline || "—";
              return (
                <tr key={f.flightNumber+i}
                  className={`flight-row ${i%2===0?"even":"odd"}`}
                  onClick={() => onFlightClick && onFlightClick(f)}>
                  <td><span className="flight-number">{f.flightNumber}</span></td>
                  <td>
                    <span className="airline-name">{alNombre}</span>
                    {/* Mostrar código IATA pequeño debajo */}
                    {airlineMap?.[f.airlineId] && (
                      <div style={{fontSize:"10px",color:"#90a4ae",fontFamily:"monospace"}}>{f.airlineId}</div>
                    )}
                  </td>
                  <td>
                    <div className="flight-iata">{loc?.iata}</div>
                    <div className="flight-city">{loc?.city}{loc?.country?`, ${loc.country}`:""}</div>
                  </td>
                  <td>
                    <div className="flight-time">{fmtTime(f.scheduledOut)}</div>
                    <div className="flight-date">{fmtDate(f.scheduledOut)}</div>
                  </td>
                  <td>
                    <div className={`flight-time${f.delayMinutes>0?" delayed":""}`}>
                      {fmtTime(f.estimatedOut)}
                    </div>
                    {f.delayMinutes>0 && <div className="flight-delay">+{f.delayMinutes} min</div>}
                  </td>
                  <td><span className="gate-badge">{f.gate}</span></td>
                  <td><span className="terminal-text">{f.terminal}</span></td>
                  <td><FlightStatusBadge status={f.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-count">Mostrando {flights.length} vuelos</div>
    </div>
  );
}
