import React from "react";

const BAGGAGE_REGULATIONS = [
  { category:"Equipaje de mano",    icon:"🎒", rules:["Dimensiones máximas: 55 × 40 × 20 cm","Peso máximo: 10 kg (varía por aerolínea)","Un (1) artículo personal adicional permitido","Líquidos en envases de máx. 100 ml en bolsa resellable de 1 L"] },
  { category:"Equipaje documentado", icon:"🧳", rules:["Peso máximo por maleta: 23 kg (economy) / 32 kg (business)","Dimensiones lineales máximas: 158 cm","Exceso de peso sujeto a cargo adicional"] },
  { category:"Artículos prohibidos", icon:"🚫", rules:["Explosivos, armas de fuego sin declaración","Baterías de litio superiores a 160 Wh en bodega","Líquidos inflamables y sustancias peligrosas","Objetos punzocortantes en cabina"] },
  { category:"Artículos especiales", icon:"⭐", rules:["Equipos médicos: notificar con 48h de anticipación","Mascotas: sujeto a normativa específica por ruta","Instrumentos musicales: como equipaje de mano si caben"] },
];

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
          <div className="baggage-notice">
            Información basada en estándares OACI. Las políticas específicas pueden variar por aerolínea.
          </div>
          {BAGGAGE_REGULATIONS.map((cat) => (
            <div key={cat.category} className="baggage-cat">
              <div className="baggage-cat__header"><span>{cat.icon}</span>{cat.category}</div>
              <div className="baggage-cat__rules">
                {cat.rules.map((rule,i) => (
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
