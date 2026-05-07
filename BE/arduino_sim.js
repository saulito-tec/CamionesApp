/**
 * arduino_sim.js — mimics the ESP32 board cycling through the route
 * Run: node arduino_sim.js
 * Mirrors the route array in SmartBus.ino exactly.
 */

const INTERVAL_MS = 2500;
const BE_URL = "http://localhost:3001/api/bus/location";

// Chihuahua city: Tec de Monterrey (ITESM) → Colonia San Felipe
const ROUTE = [
  { lat: 28.6743, lng: -106.0773 }, // 0  - Tec de Monterrey (ITESM)
  { lat: 28.6720, lng: -106.0793 }, // 1
  { lat: 28.6695, lng: -106.0813 }, // 2
  { lat: 28.6668, lng: -106.0835 }, // 3  - Nombre de Dios
  { lat: 28.6645, lng: -106.0870 }, // 4
  { lat: 28.6632, lng: -106.0915 }, // 5
  { lat: 28.6620, lng: -106.0960 }, // 6
  { lat: 28.6610, lng: -106.1005 }, // 7  - Av. División del Norte
  { lat: 28.6605, lng: -106.1045 }, // 8
  { lat: 28.6602, lng: -106.1083 }, // 9  - Centro Chihuahua
  { lat: 28.6608, lng: -106.1118 }, // 10
  { lat: 28.6620, lng: -106.1150 }, // 11 - Av. Juárez
  { lat: 28.6638, lng: -106.1175 }, // 12
  { lat: 28.6660, lng: -106.1193 }, // 13
  { lat: 28.6685, lng: -106.1208 }, // 14 - Colonia San Felipe
  { lat: 28.6710, lng: -106.1220 }, // 15
  { lat: 28.6735, lng: -106.1228 }, // 16
  { lat: 28.6760, lng: -106.1235 }, // 17
  { lat: 28.6788, lng: -106.1240 }, // 18
  { lat: 28.6815, lng: -106.1243 }, // 19 - San Felipe terminal
];

let pointIndex = 0;

async function sendLocation() {
  const { lat, lng } = ROUTE[pointIndex];
  const body = JSON.stringify({ busId: "BUS-01", lat, lng, pointIndex });

  try {
    const res = await fetch(BE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    console.log(`[Sim] point ${pointIndex}  ${lat}, ${lng}  → current: ${data.busState?.currentStop?.name}`);
  } catch (err) {
    console.error("[Sim] Failed:", err.message);
  }

  pointIndex = (pointIndex + 1) % ROUTE.length;
}

console.log("[Sim] Arduino simulator started →", BE_URL);
sendLocation();
setInterval(sendLocation, INTERVAL_MS);
