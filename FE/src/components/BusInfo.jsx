export default function BusInfo({ busState }) {
  if (!busState) {
    return (
      <aside className="bus-info">
        <p className="no-data">Esperando datos...</p>
      </aside>
    );
  }

  const ts = new Date(busState.timestamp).toLocaleTimeString();

  return (
    <aside className="bus-info">
      <h2>{busState.busId}</h2>

      <div className="info-row">
        <span className="label">Parada Actual</span>
        <span className="value">{busState.currentStop?.name ?? "—"}</span>
      </div>

      <div className="info-row highlight">
        <span className="label">Siguiente Parada</span>
        <span className="value">{busState.nextStop?.name ?? "—"}</span>
      </div>

      <div className="info-row">
        <span className="label">Coordenadas</span>
        <span className="value">
          {busState.lat.toFixed(4)}, {busState.lng.toFixed(4)}
        </span>
      </div>

      <div className="info-row">
        <span className="label">Ultima Actualización</span>
        <span className="value">{ts}</span>
      </div>
    </aside>
  );
}
