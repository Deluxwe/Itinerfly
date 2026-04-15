import React from "react";
import WidgetPanel from "../components/widgets/WidgetPanel";

export default function WidgetsPage() {
  return (
    <div className="page">
      <h1 className="page__title">Servicios & Rutas — JFK</h1>
      <p className="page__subtitle">Explora las rutas disponibles y las aerolíneas que operan en el Aeropuerto JFK.</p>
      <WidgetPanel />
    </div>
  );
}
