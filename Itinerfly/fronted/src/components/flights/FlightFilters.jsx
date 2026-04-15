import React from "react";
import { AIRLINES } from "../../data/mockData";

export default function FlightFilters({ filters, onChange }) {
  const today = new Date();
  const dates = [0,1,2].map((n) => { const d=new Date(today); d.setDate(today.getDate()+n); return d; });
  const fmtLabel = (d) => d.toDateString()===today.toDateString() ? "Hoy" : d.toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"});
  const fmtVal   = (d) => d.toISOString().split("T")[0];

  return (
    <div className="filters-row">
      <div className="filter-group">
        {dates.map((d) => {
          const val=fmtVal(d), active=filters.date===val;
          return <button key={val} onClick={()=>onChange({...filters,date:val})} className={`date-btn${active?" active":""}`}>{fmtLabel(d)}</button>;
        })}
      </div>
      <div className="filter-sep" />
      <div className="filter-group">
        {[["all","Todos"],["domestic","Nacionales"],["international","Internacionales"]].map(([type,label]) => (
          <button key={type} onClick={()=>onChange({...filters,type})} className={`type-btn${filters.type===type?" active":""}`}>{label}</button>
        ))}
      </div>
      <div className="filter-sep" />
      <select className="airline-select" value={filters.airline} onChange={(e)=>onChange({...filters,airline:e.target.value})}>
        <option value="all">Todas las aerolíneas</option>
        {AIRLINES.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <div className="location-search-wrap">
        <span className="location-search-icon">📍</span>
        <input className="location-search-input" type="text" placeholder="Ciudad, país o aeropuerto destino..."
          value={filters.locationSearch} onChange={(e)=>onChange({...filters,locationSearch:e.target.value})} />
      </div>
    </div>
  );
}
