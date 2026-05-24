import React, { useState, useEffect } from "react";
import { getAirlines, getRoutes } from "../../services/api";
import AirlineCard from "./AirlineCard";
import RouteCard   from "./RouteCard";

export default function WidgetPanel() {
  const [tab,      setTab]      = useState("routes");
  const [airlines, setAirlines] = useState([]);
  const [routes,   setRoutes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const [airlinesData, routesData] = await Promise.all([
          getAirlines(),
          getRoutes(),
        ]);
        setAirlines(airlinesData.airlines || []);
        setRoutes(routesData.routes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // Limpiar búsqueda al cambiar de tab
  function handleTabChange(nuevoTab) {
    setTab(nuevoTab);
    setBusqueda("");
  }

  // Filtrar aerolíneas por nombre, IATA o ICAO
  const airlinesFiltradas = airlines.filter(a => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.iata?.toLowerCase().includes(q) ||
      a.icao?.toLowerCase().includes(q)
    );
  });

  // Filtrar rutas por ciudad o código IATA de destino
  const routesFiltradas = routes.filter(r => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      r.to?.city?.toLowerCase().includes(q) ||
      r.to?.iata?.toLowerCase().includes(q) ||
      r.to?.name?.toLowerCase().includes(q) ||
      r.from?.iata?.toLowerCase().includes(q)
    );
  });

  const itemsFiltrados = tab === "airlines" ? airlinesFiltradas : routesFiltradas;
  const totalItems     = tab === "airlines" ? airlines.length   : routes.length;

  if (loading) {
    return (
      <div style={{ padding:"48px", textAlign:"center", color:"#90a4ae" }}>
        <div style={{ fontSize:"28px", marginBottom:"10px" }}>✈</div>
        <div style={{ fontSize:"13px" }}>Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding:"12px 16px", background:"#ffebee",
        border:"1px solid #ef9a9a", borderRadius:"8px",
        fontSize:"13px", color:"#b71c1c",
        display:"flex", alignItems:"center", gap:"8px",
      }}>
        <span>⚠️</span><span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="widget-tabs">
        {[["routes","🗺️","Rutas aéreas"],["airlines","✈️","Aerolíneas"]].map(([id,icon,label]) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`widget-tab${tab === id ? " active" : ""}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Barra de búsqueda */}
      <div style={{
        display:       "flex",
        alignItems:    "center",
        gap:           "12px",
        marginBottom:  "16px",
        flexWrap:      "wrap",
      }}>
        <div style={{ position:"relative", flex:1, minWidth:"240px" }}>
          <span style={{
            position:  "absolute",
            left:      "12px",
            top:       "50%",
            transform: "translateY(-50%)",
            fontSize:  "14px",
            color:     "#90a4ae",
            pointerEvents: "none",
          }}>
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={
              tab === "airlines"
                ? "Buscar aerolínea por nombre o código (ej: Delta, DL)..."
                : "Buscar ruta por ciudad o aeropuerto (ej: London, LHR)..."
            }
            style={{
              width:        "100%",
              padding:      "9px 12px 9px 36px",
              borderRadius: "8px",
              border:       "1.5px solid #e3e8ff",
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:     "13px",
              color:        "#263238",
              outline:      "none",
              boxSizing:    "border-box",
              transition:   "border-color 0.15s",
            }}
            onFocus={(e)  => e.target.style.borderColor = "#1a237e"}
            onBlur={(e)   => e.target.style.borderColor = "#e3e8ff"}
          />
        </div>

        {/* Botón limpiar */}
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            style={{
              padding:      "8px 14px",
              borderRadius: "8px",
              border:       "1px solid #cfd8dc",
              background:   "#fff",
              fontSize:     "12px",
              color:        "#78909c",
              cursor:       "pointer",
              whiteSpace:   "nowrap",
            }}
          >
            × Limpiar
          </button>
        )}

        {/* Contador de resultados */}
        <div style={{ fontSize:"12px", color:"#90a4ae", whiteSpace:"nowrap" }}>
          {busqueda
            ? `${itemsFiltrados.length} de ${totalItems} resultado${itemsFiltrados.length !== 1 ? "s" : ""}`
            : `${totalItems} ${tab === "airlines" ? "aerolíneas" : "rutas"}`
          }
        </div>
      </div>

      {/* Sin resultados */}
      {itemsFiltrados.length === 0 && busqueda && (
        <div style={{
          padding:      "40px",
          textAlign:    "center",
          color:        "#90a4ae",
          background:   "#f5f7ff",
          borderRadius: "12px",
          border:       "1px solid #e3e8ff",
        }}>
          <div style={{ fontSize:"28px", marginBottom:"8px" }}>🔍</div>
          <div style={{ fontSize:"14px", fontWeight:500, marginBottom:"4px" }}>
            No se encontraron resultados
          </div>
          <div style={{ fontSize:"12px" }}>
            No hay {tab === "airlines" ? "aerolíneas" : "rutas"} que coincidan con
            &ldquo;<strong>{busqueda}</strong>&rdquo;
          </div>
        </div>
      )}

      {/* Grid de tarjetas */}
      {itemsFiltrados.length > 0 && (
        <div className="widget-grid">
          {tab === "routes"
            ? routesFiltradas.map((r) => <RouteCard   key={r.id}  route={r}   />)
            : airlinesFiltradas.map((a) => <AirlineCard key={a.id} airline={a} />)
          }
        </div>
      )}
    </div>
  );
}
