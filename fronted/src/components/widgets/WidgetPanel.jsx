// ============================================================
// WidgetPanel.jsx
// Ahora carga aerolíneas y rutas desde el backend.
// Muestra loading y error si el backend no responde.
// ============================================================

import React, { useState, useEffect } from "react";
import { getAirlines, getRoutes } from "../../services/api";
import AirlineCard from "./AirlineCard";
import RouteCard from "./RouteCard";

export default function WidgetPanel() {
  const [tab,      setTab]      = useState("routes");
  const [airlines, setAirlines] = useState([]);
  const [routes,   setRoutes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

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

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#90a4ae" }}>
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>✈</div>
        <div style={{ fontSize: "13px" }}>Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "12px 16px", background: "#ffebee", border: "1px solid #ef9a9a",
        borderRadius: "8px", fontSize: "13px", color: "#b71c1c",
        display: "flex", alignItems: "center", gap: "8px",
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
            onClick={() => setTab(id)}
            className={`widget-tab${tab === id ? " active" : ""}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <p className="widget-desc">
        {tab === "routes"
          ? "Rutas aéreas disponibles desde el Aeropuerto Internacional John F. Kennedy (JFK)."
          : "Aerolíneas que operan en el Aeropuerto Internacional John F. Kennedy (JFK)."}
      </p>

      <div className="widget-grid">
        {tab === "routes"
          ? routes.map((r)    => <RouteCard   key={r.id}   route={r}   />)
          : airlines.map((a)  => <AirlineCard key={a.id}   airline={a} />)
        }
      </div>
    </div>
  );
}
