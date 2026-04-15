import React from "react";

export default function AirlineCard({ airline }) {
  return (
    <div className="airline-card">
      <div className="airline-card__header">
        <div className="airline-card__logo">✈</div>
        <div>
          <div className="airline-card__name">{airline.name}</div>
          <span className="airline-card__iata">{airline.iata}</span>
        </div>
      </div>
      <div className="airline-card__sep" />
      <div className="airline-card__info">
        {[["Asistencia",airline.phone,true],["🛫","Terminal salida",airline.terminalDep,false],["🛫","Terminal llegada",airline.terminalArr,false]].map(([icon,label,value,mono])=>(
          <div key={label} className="info-row">
            <span className="info-row__icon">{icon}</span>
            <span className="info-row__label">{label}</span>
            <span className={`info-row__value${mono?" mono":""}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
