import { useState, useEffect, useCallback } from "react";
import { getDepartures, getArrivals } from "../services/api";

export function useFlights(mode = "departures", filtros = {}) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fn    = mode === "departures" ? getDepartures : getArrivals;
      const datos = await fn(filtros);
      setFlights(datos.flights || []);
    } catch (err) {
      setError(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [mode, JSON.stringify(filtros)]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { flights, loading, error, recargar: cargar };
}
