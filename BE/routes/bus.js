const express = require("express");
const router = express.Router();

// Named stops and their matching pointIndex in the Arduino route array.
// Must stay in sync with ROUTE_SIZE / route[] in the .ino sketch.
const NAMED_STOPS = [
  { index: 0,  name: "ITESM Campus Monterrey" },
  { index: 3,  name: "Cruz Roja Monterrey" },
  { index: 7,  name: "Revolución / Garza Sada" },
  { index: 11, name: "Colonia del Valle" },
  { index: 13, name: "Tec Metro Station" },
  { index: 16, name: "Obispado" },
  { index: 19, name: "Av. Constitución" },
  { index: 23, name: "Hospital Universitario" },
  { index: 25, name: "Centro / Macroplaza" },
];

const TOTAL_POINTS = 26;

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
const ROUTE_POLYLINE = [
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

let busState = {
  busId: "BUS-01",
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
