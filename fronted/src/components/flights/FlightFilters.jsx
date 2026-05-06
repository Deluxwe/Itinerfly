import React from "react";

export default function FlightFilters({
  filters, airlines, onChange,
  locationInput, onLocationChange,
}) {
  const today = new Date();
  const dates = [0, 1, 2].map((n) => {
    const d = new Date(today);
    d.setDate(today.getDate() + n);
    return d;
  });

  const fmtLabel = (d) =>
    d.toDateString() === today.toDateString()
      ? "Hoy"
      : d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

  // Fix: usar fecha local sin zona horaria
  const fmtVal = (d) => {
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="filters-row">

      {/* Fechas */}
      <div className="filter-group">
        {dates.map((d) => {
          const val    = fmtVal(d);
          const active = filters.date === val;
          return (
            <button
              key={val}
              onClick={() => onChange({ ...filters, date: val })}
              className={`date-btn${active ? " active" : ""}`}
            >
              {fmtLabel(d)}
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

      {/* Dropdown aerolíneas — cargado dinámicamente desde el backend */}
      <select
        className="airline-select"
        value={filters.airlineId || "all"}
        onChange={(e) => onChange({ ...filters, airlineId: e.target.value })}
      >
        <option value="all">Todas las aerolíneas</option>
        {airlines.map((a) => (
          <option key={a.id} value={a.id}>
          {a.name} ({a.iata || a.id})
        </option>
        ))}
      </select>

      {/* Búsqueda por ciudad / país / aeropuerto — con debounce desde el padre */}
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
