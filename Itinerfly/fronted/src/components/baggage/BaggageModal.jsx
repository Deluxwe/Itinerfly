import React from "react";
import { BAGGAGE_REGULATIONS } from "../../data/mockData";

export default function BaggageModal({ onClose }) {
  return (
    <div className="baggage-overlay" onClick={onClose}>
      <div className="baggage-panel" onClick={(e)=>e.stopPropagation()}>
        <div className="baggage-header">
          <div>
            <div className="baggage-header__label">REGLAMENTACIÓN OACI</div>
            <div className="baggage-header__title">Equipaje</div>
          </div>
          <button className="baggage-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="baggage-body">
          <div className="baggage-notice">Información basada en estándares OACI. Las políticas específicas pueden variar por aerolínea.</div>
          {BAGGAGE_REGULATIONS.map((cat)=>(
            <div key={cat.category} className="baggage-cat">
              <div className="baggage-cat__header"><span>{cat.icon}</span>{cat.category}</div>
              <div className="baggage-cat__rules">
                {cat.rules.map((rule,i)=>(
                  <div key={i} className="baggage-rule">
                    <span className="baggage-rule__num">{i+1}</span>
                    <span className="baggage-rule__text">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
