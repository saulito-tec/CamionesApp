const express = require("express");
const router = express.Router();

// Named stops and their matching pointIndex in the Arduino route array.
// Must stay in sync with ROUTE_SIZE / route[] in the .ino sketch.
const NAMED_STOPS = [
  { index: 0, name: "Tec de Monterrey (ITESM)" },
  { index: 3, name: "Nombre de Dios" },
  { index: 7, name: "Av. División del Norte" },
  { index: 9, name: "Centro Chihuahua" },
  { index: 11, name: "Av. Juárez" },
  { index: 14, name: "Colonia San Felipe" },
  { index: 19, name: "San Felipe" },
];

const TOTAL_POINTS = 20;

function findCurrentStop(pointIndex) {
  let last = NAMED_STOPS[0];
  for (const stop of NAMED_STOPS) {
    if (stop.index <= pointIndex) last = stop;
    else break;
  }
  return last;
}

function findNextStop(pointIndex) {
  for (const stop of NAMED_STOPS) {
    if (stop.index > pointIndex) return stop;
  }
  return NAMED_STOPS[0]; // loop back
}

// Full route for FE polyline — matches route[] in .ino exactly
// Chihuahua city: Tec de Monterrey (ITESM) → Colonia San Felipe
const ROUTE_POLYLINE = [
  { lat: 28.6743, lng: -106.0773 }, // 0  - Tec de Monterrey (ITESM)
  { lat: 28.672, lng: -106.0793 }, // 1
  { lat: 28.6695, lng: -106.0813 }, // 2
  { lat: 28.6668, lng: -106.0835 }, // 3  - Nombre de Dios
  { lat: 28.6645, lng: -106.087 }, // 4
  { lat: 28.6632, lng: -106.0915 }, // 5
  { lat: 28.662, lng: -106.096 }, // 6
  { lat: 28.661, lng: -106.1005 }, // 7  - Av. División del Norte
  { lat: 28.6605, lng: -106.1045 }, // 8
  { lat: 28.6602, lng: -106.1083 }, // 9  - Centro Chihuahua
  { lat: 28.6608, lng: -106.1118 }, // 10
  { lat: 28.662, lng: -106.115 }, // 11 - Av. Juárez
  { lat: 28.6638, lng: -106.1175 }, // 12
  { lat: 28.666, lng: -106.1193 }, // 13
  { lat: 28.6685, lng: -106.1208 }, // 14 - Colonia San Felipe
  { lat: 28.671, lng: -106.122 }, // 15
  { lat: 28.6735, lng: -106.1228 }, // 16
  { lat: 28.676, lng: -106.1235 }, // 17
  { lat: 28.6788, lng: -106.124 }, // 18
  { lat: 28.6815, lng: -106.1243 }, // 19 - San Felipe terminal
];

let busState = {
  busId: "Ruta 1",
  lat: ROUTE_POLYLINE[0].lat,
  lng: ROUTE_POLYLINE[0].lng,
  pointIndex: 0,
  currentStop: NAMED_STOPS[0],
  nextStop: NAMED_STOPS[1],
  timestamp: Date.now(),
};

// Arduino POSTs here: { busId, lat, lng, pointIndex }
router.post("/location", (req, res) => {
  const { busId, lat, lng, pointIndex } = req.body;

  if (lat === undefined || lng === undefined || pointIndex === undefined) {
    return res.status(400).json({ error: "Missing lat, lng or pointIndex" });
  }

  busState = {
    busId: busId || busState.busId,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    pointIndex: parseInt(pointIndex),
    currentStop: findCurrentStop(pointIndex),
    nextStop: findNextStop(pointIndex),
    timestamp: Date.now(),
  };

  req.app.get("io").emit("busUpdate", busState);
  res.json({ ok: true, busState });
});

router.get("/state", (req, res) => {
  res.json({ busState, route: ROUTE_POLYLINE, stops: NAMED_STOPS });
});

router.get("/route", (req, res) => {
  res.json({ polyline: ROUTE_POLYLINE, stops: NAMED_STOPS });
});

function updateBusPosition(io, lat, lng, segmentIndex) {
  busState = {
    busId: busState.busId,
    lat,
    lng,
    pointIndex: segmentIndex,
    currentStop: findCurrentStop(segmentIndex),
    nextStop: findNextStop(segmentIndex),
    timestamp: Date.now(),
  };
  io.emit("busUpdate", busState);
}

module.exports = router;
module.exports.updateBusPosition = updateBusPosition;
module.exports.ROUTE_POLYLINE = ROUTE_POLYLINE;
