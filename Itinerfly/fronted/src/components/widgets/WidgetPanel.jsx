import React, { useState } from "react";
import { AIRLINES, ROUTES } from "../../data/mockData";
import AirlineCard from "./AirlineCard";
import RouteCard from "./RouteCard";

export default function WidgetPanel() {
  const [tab, setTab] = useState("routes");
  return (
    <div>
      <div className="widget-tabs">
        {[["routes","🧭","Rutas aéreas"],["airlines","✈️","Aerolíneas"]].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} className={`widget-tab${tab===id?" active":""}`}>{icon} {label}</button>
        ))}
      </div>
      <p className="widget-desc">
        {tab==="routes" ? "Rutas aéreas disponibles desde el Aeropuerto Internacional John F. Kennedy (JFK)." : "Aerolíneas que operan en el Aeropuerto Internacional John F. Kennedy (JFK)."}
      </p>
      <div className="widget-grid">
        {tab==="routes" ? ROUTES.map((r)=><RouteCard key={r.id} route={r}/>) : AIRLINES.map((a)=><AirlineCard key={a.id} airline={a}/>)}
      </div>
    </div>
  );
}
