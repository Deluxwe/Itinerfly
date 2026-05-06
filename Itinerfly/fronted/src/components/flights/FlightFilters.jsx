import React from "react";

// Genera fecha en formato YYYY-MM-DD en hora LOCAL (sin UTC)
function getFechaLocal(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function getLabelDia(offsetDias) {
  if (offsetDias === 0) return "Hoy";
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

export default function FlightFilters({
  filters, airlines, onChange,
  locationInput, onLocationChange,
}) {
  return (
    <div className="filters-row">

      {/* Fechas — 0=hoy, 1=mañana, 2=pasado */}
      <div className="filter-group">
        {[0, 1, 2].map((offset) => {
          const val    = getFechaLocal(offset);
          const active = filters.date === val;
          return (
            <button
              key={offset}
              onClick={() => onChange({ ...filters, date: val })}
              className={`date-btn${active ? " active" : ""}`}
            >
              {getLabelDia(offset)}
            </button>
          );
        })}
      </div>

      <div className="filter-sep" />

      {/* Tipo nacional / internacional */}
      <div className="filter-group">
        {[["all","Todos"],["domestic","Nacionales"],["international","Internacionales"]].map(([type, label]) => (
          <button
            key={type}
            onClick={() => onChange({ ...filters, type })}
            className={`type-btn${filters.type === type ? " active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filter-sep" />

      {/* Aerolíneas desde backend */}
      <select
        className="airline-select"
        value={filters.airline}
        onChange={(e) => onChange({ ...filters, airline: e.target.value })}
      >
        <option value="all">Todas las aerolíneas</option>
        {airlines.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.iata})
          </option>
        ))}
      </select>

      {/* Búsqueda por ciudad / aeropuerto */}
      <div className="location-search-wrap">
        <span className="location-search-icon">🔍</span>
        <input
          className="location-search-input"
          type="text"
          placeholder="Ciudad, país o aeropuerto destino..."
          value={locationInput}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

    </div>
  );
}
