import React from "react";

export default function Navbar({ activePage, onNavigate, onBaggageClick, isAMW }) {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-box">✈</div>
        <div>
          <div className="navbar__logo-name">JFK</div>
          <div className="navbar__logo-sub">JOHN F. KENNEDY</div>
        </div>
      </div>
      {[["itinerary","Itinerario"],["widgets","Servicios"]].map(([id,icon,label]) => (
        <button key={id} onClick={() => onNavigate(id)} className={`navbar__tab${activePage===id?" active":""}`}>
          {icon} {label}
        </button>
      ))}
      <div className="navbar__right">
        <button className="navbar__baggage-btn" onClick={onBaggageClick}>🧳 Equipaje</button>
        {isAMW && (
          <div className="navbar__amw-badge">
            <div className="navbar__amw-dot" />
            <span className="navbar__amw-label">AMW</span>
          </div>
        )}
      </div>
    </nav>
  );
}
