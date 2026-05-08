/**
 * arduino_sim.js — mimics the ESP32 board cycling through the route
 * Run: node arduino_sim.js
 * Mirrors the route array in SmartBus.ino exactly.
 */

const INTERVAL_MS = 2500;
const BE_URL = "http://localhost:3001/api/bus/location";

// Chihuahua city: ITESM → south on Heroico Colegio Militar → west through city → north to San Felipe
const ROUTE = [
  { lat: 28.6743, lng: -106.0773 }, // 0  - Tec de Monterrey (ITESM)
  { lat: 28.6726, lng: -106.0787 }, // 1
  { lat: 28.6708, lng: -106.0802 }, // 2
  { lat: 28.6689, lng: -106.0819 }, // 3  - Nombre de Dios
  { lat: 28.6668, lng: -106.0845 }, // 4
  { lat: 28.6650, lng: -106.0883 }, // 5
  { lat: 28.6634, lng: -106.0928 }, // 6
  { lat: 28.6621, lng: -106.0973 }, // 7  - Av. División del Norte
  { lat: 28.6611, lng: -106.1015 }, // 8
  { lat: 28.6604, lng: -106.1055 }, // 9
  { lat: 28.6599, lng: -106.1093 }, // 10 - Centro Chihuahua
  { lat: 28.6597, lng: -106.1128 }, // 11
  { lat: 28.6600, lng: -106.1158 }, // 12
  { lat: 28.6615, lng: -106.1170 }, // 13 - Av. Juárez, turning north
  { lat: 28.6633, lng: -106.1183 }, // 14
  { lat: 28.6652, lng: -106.1195 }, // 15
  { lat: 28.6673, lng: -106.1206 }, // 16
  { lat: 28.6695, lng: -106.1215 }, // 17 - Colonia San Felipe
  { lat: 28.6718, lng: -106.1222 }, // 18
  { lat: 28.6740, lng: -106.1229 }, // 19
  { lat: 28.6762, lng: -106.1233 }, // 20
  { lat: 28.6783, lng: -106.1237 }, // 21
  { lat: 28.6804, lng: -106.1240 }, // 22
  { lat: 28.6812, lng: -106.1242 }, // 23
  { lat: 28.6815, lng: -106.1243 }, // 24 - San Felipe terminal
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
