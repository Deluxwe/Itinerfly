const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function apiFetch(ruta, opciones = {}) {
  const token = localStorage.getItem("jfk_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };
  try {
    const respuesta = await fetch(`${BASE_URL}${ruta}`, { ...opciones, headers });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
    return datos.data;
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("No se puede conectar con el servidor. ¿Está corriendo el backend en puerto 4000?");
    }
    throw err;
  }
}

function buildQuery(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
}

export async function getDepartures(params = {}) {
  return apiFetch(`/flights/departures${buildQuery(params)}`);
}

export async function getArrivals(params = {}) {
  return apiFetch(`/flights/arrivals${buildQuery(params)}`);
}

export async function getFlightByCode(codigo) {
  return apiFetch(`/flights/${encodeURIComponent(codigo)}`);
}

export async function searchByLocation(query, mode = "departures") {
  return apiFetch(`/flights/search${buildQuery({ q: query, mode })}`);
}

export async function getAirlines() {
  return apiFetch("/airlines");
}

export async function getRoutes() {
  return apiFetch("/airlines/routes");
}

export async function login(username, password) {
  const datos = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem("jfk_token", datos.token);
  localStorage.setItem("jfk_user",  JSON.stringify(datos.user));
  return datos;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem("jfk_token");
    localStorage.removeItem("jfk_user");
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("jfk_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAMW() {
  return getCurrentUser()?.role === "AMW";
}
