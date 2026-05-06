export default function BusInfo({ busState }) {
  if (!busState) {
    return (
      <aside className="bus-info">
        <p className="no-data">Waiting for bus data...</p>
      </aside>
    );
  }

  const ts = new Date(busState.timestamp).toLocaleTimeString();

  return (
    <aside className="bus-info">
      <h2>{busState.busId}</h2>

      <div className="info-row">
        <span className="label">Current Stop</span>
        <span className="value">{busState.currentStop?.name ?? "—"}</span>
      </div>

      <div className="info-row highlight">
        <span className="label">Next Stop</span>
        <span className="value">{busState.nextStop?.name ?? "—"}</span>
      </div>

      <div className="info-row">
        <span className="label">Coordinates</span>
        <span className="value">
          {busState.lat.toFixed(4)}, {busState.lng.toFixed(4)}
        </span>
      </div>

      <div className="info-row">
        <span className="label">Stop Index</span>
        <span className="value">{busState.stopIndex}</span>
      </div>

      <div className="info-row">
        <span className="label">Last Update</span>
        <span className="value">{ts}</span>
      </div>
    </aside>
  );
}
