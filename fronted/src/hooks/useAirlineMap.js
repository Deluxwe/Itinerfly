// Hook que carga las aerolíneas y devuelve un mapa ID → nombre
import { useState, useEffect } from "react";
import { getAirlines } from "../services/api";

export function useAirlineMap() {
  const [airlineMap, setAirlineMap] = useState({});
  const [airlines,   setAirlines]   = useState([]);

  useEffect(() => {
    getAirlines()
      .then(data => {
        const list = data.airlines || [];
        setAirlines(list);
        const map = {};
        list.forEach(a => { map[a.id] = a.name; });
        setAirlineMap(map);
      })
      .catch(() => {});
  }, []);

  return { airlineMap, airlines };
}
