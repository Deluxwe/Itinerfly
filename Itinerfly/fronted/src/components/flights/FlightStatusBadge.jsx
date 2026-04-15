import React from "react";

const STATUS_LABELS = {
  ON_TIME:   "A tiempo",
  DELAYED:   "Atrasado",
  BOARDING:  "En embarque",
  LAST_CALL: "Último llamado",
  CLOSED:    "Cerrado",
  IN_FLIGHT: "En vuelo",
  LANDED:    "Aterrizado",
  CANCELLED: "Cancelado",
};

export default function FlightStatusBadge({ status, size = "md" }) {
  return (
    <span className={`status-badge status-${status}${size === "lg" ? " lg" : ""}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
