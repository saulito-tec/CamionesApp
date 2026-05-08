import { useState } from "react";

const STREAM_URL = "http://192.168.1.1/index.html";

function CameraPanel() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const [key, setKey] = useState(0);

  const reconnect = () => {
    setError(false);
    setConnected(false);
    setKey((k) => k + 1);
  };

  return (
    <div className="camera-panel">
      <h2>Cámara de la parada</h2>

      <div className="camera-box">
        <img
          key={key}
          src={STREAM_URL}
          className="camera-video"
          alt="IP camera stream"
          onLoad={() => {
            setConnected(true);
            setError(false);
          }}
          onError={() => {
            setConnected(false);
            setError(true);
          }}
        />
      </div>

      {error && (
        <p className="camera-error">No se pudo conectar a {STREAM_URL}</p>
      )}

      <div className="camera-status">
        <p>
          Estado de cámara:{" "}
          <strong>{connected ? "Conectada" : "Sin conexión"}</strong>
        </p>
        <p>
          Detección:{" "}
          <strong>
            {personDetected ? "Persona esperando" : "Parada vacía"}
          </strong>
        </p>
      </div>

      <button className="btn-reconnect" onClick={reconnect}>
        Reconectar cámara
      </button>

      <button
        className={personDetected ? "btn-danger" : "btn-success"}
        style={{ marginTop: "8px" }}
        onClick={() => setPersonDetected((p) => !p)}
      >
        {personDetected ? "Marcar parada vacía" : "Simular persona detectada"}
      </button>
    </div>
  );
}

export default CameraPanel;
