import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const busIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2563eb;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5);">🚌</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const nextStopIcon = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);">★</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Animates the bus marker at 60fps using RAF lerp toward the target position.
// Also smoothly pans the map to follow.
function AnimatedBusMarker({ busState }) {
  const markerRef = useRef(null);
  const map = useMap();
  const current = useRef(null); // { lat, lng } — interpolated position
  const target = useRef(null); // { lat, lng } — latest from server
  const rafId = useRef(null);

  // Update target whenever server sends new position
  useEffect(() => {
    if (!busState) return;
    target.current = { lat: busState.lat, lng: busState.lng };
    if (!current.current) {
      current.current = { lat: busState.lat, lng: busState.lng };
    }
  }, [busState]);

  // 60fps lerp loop
  useEffect(() => {
    const LERP = 0.01; // 0–1: higher = snappier, lower = more lag

    function tick() {
      if (markerRef.current && current.current && target.current) {
        const c = current.current;
        const t = target.current;

        const lat = c.lat + (t.lat - c.lat) * LERP;
        const lng = c.lng + (t.lng - c.lng) * LERP;

        current.current = { lat, lng };
        markerRef.current.setLatLng([lat, lng]);
        map.panTo([lat, lng], { animate: false, duration: 0 });
      }
      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [map]);

  if (!busState) return null;

  return (
    <Marker
      ref={markerRef}
      position={[busState.lat, busState.lng]}
      icon={busIcon}
    >
      <Popup>{busState.busId}</Popup>
    </Marker>
  );
}


export default function BusMap({ busState, polyline, stops }) {
  const center = busState
    ? [busState.lat, busState.lng]
    : polyline.length
      ? [polyline[0].lat, polyline[0].lng]
      : [25.6514, -100.2896];

  const polylinePositions = polyline.map((p) => [p.lat, p.lng]);

  const nextStopData = busState?.nextStop
    ? polyline[busState.nextStop.index]
    : null;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#2563eb"
            weight={5}
            opacity={0.65}
          />
        )}

        {polyline.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={3}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#2563eb",
              fillOpacity: 0.8,
              weight: 1,
            }}
          />
        ))}

        {stops.map((stop, i) => {
          const pt = polyline[stop.index];
          if (!pt) return null;
          return (
            <Marker key={i} position={[pt.lat, pt.lng]}>
              <Popup>{stop.name}</Popup>
            </Marker>
          );
        })}

        <AnimatedBusMarker busState={busState} />

        {nextStopData && busState?.nextStop && (
          <Marker
            position={[nextStopData.lat, nextStopData.lng]}
            icon={nextStopIcon}
          >
            <Popup>Next Stop: {busState.nextStop.name}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
