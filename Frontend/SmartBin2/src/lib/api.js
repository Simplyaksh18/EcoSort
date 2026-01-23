// Prefer local backend during development, otherwise use production URL
const defaultProd = "https://ecosort-h6tp.onrender.com";
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
export const API_BASE_URL = isLocal ? "http://localhost:8080" : defaultProd;
const base = `${API_BASE_URL}/api`;

export async function getBins() {
  try {
    const r = await fetch(`${base}/bins`);
    if (!r.ok) throw new Error("API failed");
    return await r.json();
  } catch {
    return []; // 🔑 NEVER crash UI
  }
}

export async function getDrivers() {
  try {
    const r = await fetch(`${base}/drivers`);
    if (!r.ok) throw new Error("API failed");
    return await r.json();
  } catch {
    return []; // 🔑 NEVER crash UI
  }
}
export async function getStations() {
  try {
    const r = await fetch(`${base}/stations`);
    if (!r.ok) throw new Error("API failed");
    return await r.json();
  } catch {
    return []; // 🔑 NEVER crash UI
  }
}
export async function getTrips() {
  try {
    const r = await fetch(`${base}/trips`);
    if (!r.ok) throw new Error("API failed");
    return await r.json();
  } catch {
    return []; // 🔑 NEVER crash UI
  }
}

export async function dispatchTruck({ binId, driverId, stationId }) {
  const r = await fetch(`${base}/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ binId, driverId, stationId }),
  });
  if (!r.ok) throw new Error("Dispatch failed");
  return r.json();
}
export async function updateTrip(id, payload) {
  const r = await fetch(`${base}/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Update failed");
  return r.json();
}
