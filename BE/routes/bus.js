const express = require("express");
const router = express.Router();

// Named stops and their matching pointIndex in the Arduino route array.
// Must stay in sync with ROUTE_SIZE / route[] in the .ino sketch.
const NAMED_STOPS = [
  { index: 0,  name: "Tec de Monterrey (ITESM)" },
  { index: 3,  name: "Nombre de Dios" },
  { index: 7,  name: "Av. División del Norte" },
  { index: 10, name: "Centro Chihuahua" },
  { index: 13, name: "Av. Juárez" },
  { index: 17, name: "Colonia San Felipe" },
  { index: 24, name: "San Felipe" },
];

const TOTAL_POINTS = 25;

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

// Chihuahua city: ITESM → south on Heroico Colegio Militar → west through city → north to San Felipe
const ROUTE_POLYLINE = [
  { lat: 28.6743, lng: -106.0773 }, // 0  - Tec de Monterrey (ITESM)
  { lat: 28.6726, lng: -106.0787 }, // 1  - Heroico Colegio Militar south
  { lat: 28.6708, lng: -106.0802 }, // 2
  { lat: 28.6689, lng: -106.0819 }, // 3  - Nombre de Dios
  { lat: 28.6668, lng: -106.0845 }, // 4  - Turning west
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

router.post("/reset", (req, res) => {
  const routeState = req.app.get("routeState");
  routeState.segmentIndex = 0;
  routeState.progress = 0;

  busState = {
    busId: busState.busId,
    lat: ROUTE_POLYLINE[0].lat,
    lng: ROUTE_POLYLINE[0].lng,
    pointIndex: 0,
    currentStop: NAMED_STOPS[0],
    nextStop: NAMED_STOPS[1],
    timestamp: Date.now(),
  };

  req.app.get("io").emit("busUpdate", busState);
  res.json({ ok: true });
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
