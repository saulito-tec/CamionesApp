export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-logo">🚌</div>
        <h1 className="start-title">Bio-Stop</h1>
        <p className="start-subtitle">Monitoreo de rutas en tiempo real</p>
        <button className="start-btn" onClick={onStart}>
          Iniciar
        </button>
      </div>
    </div>
  );
}
