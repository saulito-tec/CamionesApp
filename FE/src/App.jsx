import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import BusMap from "./components/BusMap";
import BusInfo from "./components/BusInfo";
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
    // Initial load
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

    // Socket.io — real-time updates
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("busUpdate", (data) => setBusState({ ...data }));

    // Polling fallback every 2s (covers cases where socket drops)
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
        <h1>Smart Bus Tracker</h1>
        <span className={`status ${connected ? "online" : "offline"}`}>
          {connected ? "● Live" : "● Polling"}
        </span>
      </header>
      <main className="app-body">
        <BusMap busState={busState} polyline={polyline} stops={stops} />
        <BusInfo busState={busState} />
      </main>
    </div>
  );
}
