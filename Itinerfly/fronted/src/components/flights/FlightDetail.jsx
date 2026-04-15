import React from "react";
import { AIRLINES } from "../../data/mockData";
import FlightStatusBadge from "./FlightStatusBadge";

const fmtDT = (iso) => iso ? new Date(iso).toLocaleString("es-ES",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false}) : "—";

function Row({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className={`detail-row__value${mono?" mono":""}`}>{value}</span>
    </div>
  );
}

export default function FlightDetail({ flight, onClose }) {
  if (!flight) return null;
  const airline = AIRLINES.find((a)=>a.id===flight.airline);
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e)=>e.stopPropagation()}>
        <div className="detail-header">
          <div className="detail-header__top">
            <div>
              <div className="detail-header__label">DETALLES DEL VUELO</div>
              <div className="detail-header__fn">{flight.flightNumber}</div>
              <div className="detail-header__airline">{airline?.name||flight.airline}</div>
            </div>
            <button className="detail-close-btn" onClick={onClose}>×</button>
          </div>
          <div className="detail-route">
            <div style={{textAlign:"center"}}>
              <div className="detail-route__iata">{flight.origin.iata}</div>
              <div className="detail-route__city">{flight.origin.city}</div>
            </div>
            <div className="detail-route__arrow">✈</div>
            <div style={{textAlign:"center"}}>
              <div className="detail-route__iata">{flight.destination.iata}</div>
              <div className="detail-route__city">{flight.destination.city}</div>
            </div>
          </div>
        </div>
        <div className="detail-status-bar">
          <FlightStatusBadge status={flight.status} size="lg" />
          {flight.status==="DELAYED"&&flight.delayMinutes>0 && <span className="detail-delay-text">Retraso: +{flight.delayMinutes} min</span>}
        </div>
        <div className="detail-map">
          <div className="detail-map__icon">🗺️</div>
          <div className="detail-map__title">Mapa de trayectoria</div>
          <div className="detail-map__note">{flight.origin.iata} → {flight.destination.iata}<br/><em>Conectar react-leaflet + FlightAware API</em></div>
        </div>
        <div className="detail-body">
          <div className="detail-section">INFORMACIÓN OPERACIONAL — OACI</div>
          <Row label="Número de vuelo"  value={flight.flightNumber} mono />
          <Row label="Aerolínea"        value={airline?.name||flight.airline} />
          <Row label="Aeronave"         value={flight.aircraft} />
          <Row label="Tipo de vuelo"    value={flight.type==="domestic"?"Nacional":"Internacional"} />
          <Row label="Origen"           value={`${flight.origin.iata} — ${flight.origin.city}`} />
          <Row label="Destino"          value={`${flight.destination.iata} — ${flight.destination.city}`} />
          <Row label="Hora programada"  value={fmtDT(flight.scheduledOut)} mono />
          <Row label="Hora estimada"    value={fmtDT(flight.estimatedOut)} mono />
          <Row label="Puerta"           value={flight.gate} mono />
          <Row label="Terminal"         value={flight.terminal} />
          <Row label="Matrícula"        value={flight.registration||"—"} mono />
          <Row label="Callsign"         value={flight.callsign||"—"} mono />
          <Row label="Altitud crucero"  value={flight.cruiseAltitudeFt?`${flight.cruiseAltitudeFt.toLocaleString()} ft`:"—"} mono />
          <Row label="Velocidad crucero" value={flight.cruiseSpeedKts?`${flight.cruiseSpeedKts} kts`:"—"} mono />
          {airline && <>
            <div className="detail-section">CONTACTO AEROLÍNEA</div>
            <Row label="Teléfono asistencia" value={airline.phone} mono />
            <Row label="Terminal salidas"    value={airline.terminalDep} />
            <Row label="Terminal llegadas"   value={airline.terminalArr} />
          </>}
          <div className="detail-note"><strong>Nota:</strong> Datos adicionales OACI (transponder, altitud en tiempo real) disponibles vía FlightAware API en el backend.</div>
        </div>
      </div>
    </div>
  );
}
