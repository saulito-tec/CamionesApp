/**
 * arduino_sim.js — mimics the ESP32 board cycling through the route
 * Run: node arduino_sim.js
 * Mirrors the route array in SmartBus.ino exactly.
 */

const INTERVAL_MS = 2500;
const BE_URL = "http://localhost:3001/api/bus/location";

const ROUTE = [
  { lat: 25.6514, lng: -100.2896 },
  { lat: 25.6535, lng: -100.2901 },
  { lat: 25.6558, lng: -100.2907 },
  { lat: 25.6581, lng: -100.2912 },
  { lat: 25.6604, lng: -100.2918 },
  { lat: 25.6627, lng: -100.2923 },
  { lat: 25.6651, lng: -100.2928 },
  { lat: 25.6672, lng: -100.2933 },
  { lat: 25.6681, lng: -100.2960 },
  { lat: 25.6686, lng: -100.2990 },
  { lat: 25.6688, lng: -100.3020 },
  { lat: 25.6690, lng: -100.3050 },
  { lat: 25.6691, lng: -100.3080 },
  { lat: 25.6693, lng: -100.3100 },
  { lat: 25.6700, lng: -100.3120 },
  { lat: 25.6712, lng: -100.3145 },
  { lat: 25.6727, lng: -100.3165 },
  { lat: 25.6748, lng: -100.3153 },
  { lat: 25.6769, lng: -100.3138 },
  { lat: 25.6789, lng: -100.3121 },
  { lat: 25.6810, lng: -100.3105 },
  { lat: 25.6831, lng: -100.3090 },
  { lat: 25.6851, lng: -100.3076 },
  { lat: 25.6869, lng: -100.3063 },
  { lat: 25.6885, lng: -100.3051 },
  { lat: 25.6900, lng: -100.3040 },
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
