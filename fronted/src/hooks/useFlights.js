import { useState, useEffect, useCallback } from "react";
import { getDepartures, getArrivals, getAirlines } from "../services/api";

// Obtiene fecha local en formato YYYY-MM-DD sin problemas de zona horaria
function getFechaLocal() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useFlights(mode = "departures", filtros = {}) {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]); // <--- Nuevo estado para aerolíneas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fn = mode === "departures" ? getDepartures : getArrivals;
      const params = {
        ...filtros,
        date: filtros.date || getFechaLocal(),
      };

      const [datosVuelos, datosAirlines] = await Promise.all([
        fn(params),
        getAirlines(params) 
      ]);

      setFlights(datosVuelos.flights || []);
      setAirlines(datosAirlines || []); 
    } catch (err) {
      setError(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [mode, JSON.stringify(filtros)]);

  useEffect(() => { cargar(); }, [cargar]);


  return { flights, airlines, loading, error, recargar: cargar };
}
