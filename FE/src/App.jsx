import { useEffect, useState, useRef } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { io } from "socket.io-client";
import MapPage from "./pages/MapPage";
import MonitoreoPage from "./pages/MonitoreoPage";
import "./App.css";

const BE = "http://localhost:3001";
const socket = io(BE);

export default function App() {
  const [busState, setBusState] = useState(null);
  const [polyline, setPolyline] = useState([]);
  const [stops, setStops] = useState([]);
  const [connected, setConnected] = useState(false);
  const pollRef = useRef(null);

  async function fetchState() {
    try {
      const res = await fetch(`${BE}/api/bus/state`);
      const data = await res.json();
      if (data.busState) setBusState(data.busState);
    } catch (e) {
      console.error("poll failed", e);
    }
  }

  useEffect(() => {
    Promise.all([
      fetch(`${BE}/api/bus/state`).then((r) => r.json()),
      fetch(`${BE}/api/bus/route`).then((r) => r.json()),
    ])
      .then(([stateData, routeData]) => {
        if (stateData.busState) setBusState(stateData.busState);
        if (routeData.polyline) setPolyline(routeData.polyline);
        if (routeData.stops) setStops(routeData.stops);
      })
      .catch((e) => console.error("initial fetch failed", e));

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("busUpdate", (data) => setBusState({ ...data }));

    pollRef.current = setInterval(fetchState, 2000);

    return () => {
      socket.off("busUpdate");
      socket.off("connect");
      socket.off("disconnect");
      clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bio-Stop</h1>
        <span className={`status ${connected ? "online" : "offline"}`}>
          {connected ? "● Live" : "● Polling"}
        </span>
      </header>

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={<MapPage busState={busState} polyline={polyline} stops={stops} />}
          />
          <Route path="/monitoreo" element={<MonitoreoPage />} />
        </Routes>
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🗺️</span>
          <span className="nav-label">Mapa</span>
        </NavLink>
        <NavLink to="/monitoreo" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Monitoreo</span>
        </NavLink>
      </nav>
    </div>
  );
}
