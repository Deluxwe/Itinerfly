import React, { useState, useRef } from "react";
import { useFlights }    from "../hooks/useFlights";
import { useAirlineMap } from "../hooks/useAirlineMap";
import FlightTable  from "../components/flights/FlightTable";
import FlightDetail from "../components/flights/FlightDetail";

function getFechaLocal() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`;
}

const LEGEND = [
  ["A tiempo","status-ON_TIME"],["Atrasado","status-DELAYED"],
  ["En embarque","status-BOARDING"],["Último llamado","status-LAST_CALL"],
  ["Cerrado","status-CLOSED"],["En vuelo","status-IN_FLIGHT"],
  ["Aterrizado","status-LANDED"],["Cancelado","status-CANCELLED"],
];

export default function HomePage() {
  const [mode,     setMode]     = useState("departures");
  const [selected, setSelected] = useState(null);
  const [searchInput,   setSearchInput]   = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [filtros, setFiltros] = useState({
    date: getFechaLocal(), type:"all", airline:"all", search:"", location:"",
  });

  const debounceSearch   = useRef(null);
  const debounceLocation = useRef(null);

  // Carga aerolíneas y construye el mapa ID→nombre
  const { airlineMap, airlines } = useAirlineMap();

  function handleSearchChange(v) {
    setSearchInput(v);
    clearTimeout(debounceSearch.current);
    debounceSearch.current = setTimeout(() =>
      setFiltros(p => ({ ...p, search: v })), 500);
  }

  function handleLocationChange(v) {
    setLocationInput(v);
    clearTimeout(debounceLocation.current);
    debounceLocation.current = setTimeout(() =>
      setFiltros(p => ({ ...p, location: v })), 500);
  }

  const { flights, loading, error, recargar } = useFlights(mode, filtros);

  return (
    <div className="page">
      <h1 className="page__title">Itinerario de Vuelos — JFK</h1>
      <p className="page__subtitle">Haz clic en un vuelo para ver los detalles completos.</p>

      <div className="mode-bar">
        <div className="mode-toggle">
          {[["departures","🛫","Salidas"],["arrivals","🛬","Llegadas"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setMode(id)} className={`mode-btn${mode===id?" active":""}`}>
              {icon} {label}
            </button>
          ))}
        </div>
        <button onClick={recargar} disabled={loading} style={{
          padding:"6px 14px",borderRadius:"6px",border:"1px solid #e3e8ff",
          background:"#fff",fontSize:"12px",color:"#1a237e",
          cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,
        }}>
          {loading?"Cargando...":"↻ Actualizar"}
        </button>
        <div className="realtime-indicator">
          <div className="realtime-dot"/>
          {loading?"Consultando backend...":"Backend conectado ✓"}
        </div>
      </div>

      {error && (
        <div style={{padding:"12px 16px",background:"#ffebee",border:"1px solid #ef9a9a",
          borderRadius:"8px",marginBottom:"16px",fontSize:"13px",color:"#b71c1c",
          display:"flex",alignItems:"center",gap:"8px"}}>
          <span>⚠️</span><span>{error}</span>
          <button onClick={recargar} style={{marginLeft:"auto",padding:"4px 10px",
            borderRadius:"4px",border:"1px solid #ef9a9a",background:"transparent",
            color:"#b71c1c",cursor:"pointer",fontSize:"12px"}}>Reintentar</button>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{padding:"48px",textAlign:"center",color:"#90a4ae"}}>
            <div style={{fontSize:"32px",marginBottom:"12px"}}>✈</div>
            <div style={{fontSize:"14px"}}>Consultando vuelos...</div>
          </div>
        ) : (
          <FlightTable
            flights={flights}
            mode={mode}
            onFlightClick={setSelected}
            filtros={filtros}
            airlines={airlines}
            airlineMap={airlineMap}
            searchInput={searchInput}
            locationInput={locationInput}
            onFiltrosChange={setFiltros}
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
          />
        )}
      </div>

      <div className="legend-card">
        <div className="legend-title">ESTADOS IATA AIDM</div>
        <div className="legend-row">
          {LEGEND.map(([label,cls]) => (
            <span key={label} className={`status-badge ${cls}`}>{label}</span>
          ))}
        </div>
      </div>

      {selected && <FlightDetail flight={selected} airlineMap={airlineMap} onClose={() => setSelected(null)}/>}
    </div>
  );
}
