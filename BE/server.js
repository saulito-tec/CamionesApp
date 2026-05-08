const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const busRoutes = require("./routes/bus");
const cameraRoutes = require("./routes/camera");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.set("io", io);
app.use("/api/bus", busRoutes);
app.use("/api/camera", cameraRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`BE running on port ${PORT}`);

  const { ROUTE_POLYLINE, updateBusPosition } = require("./routes/bus");

  const SEGMENT_DURATION_MS = 3000; // time to travel between two waypoints
  const TICK_MS = 500;              // server ticks — FE lerp handles visual smoothness

  let segmentIndex = 0;   // current segment: from point[i] to point[i+1]
  let progress = 0;       // 0.0 → 1.0 across the segment

  setInterval(() => {
    progress += TICK_MS / SEGMENT_DURATION_MS;

    if (progress >= 1.0) {
      progress = 0;
      segmentIndex = (segmentIndex + 1) % (ROUTE_POLYLINE.length - 1);
    }

    const from = ROUTE_POLYLINE[segmentIndex];
    const to   = ROUTE_POLYLINE[segmentIndex + 1];

    const lat = from.lat + (to.lat - from.lat) * progress;
    const lng = from.lng + (to.lng - from.lng) * progress;

    updateBusPosition(io, lat, lng, segmentIndex);
  }, TICK_MS);

  console.log(`Bus animating — segment ${SEGMENT_DURATION_MS / 1000}s, tick ${TICK_MS}ms`);
});
