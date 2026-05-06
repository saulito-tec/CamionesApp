import { useEffect, useRef, useState } from "react";

function CameraPanel() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setError("");
    } catch (err) {
      setError("No se pudo acceder a la cámara. Revisa permisos del navegador.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-panel">
      <h2>Cámara de la parada</h2>

      <div className="camera-box">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
      </div>

      {error && <p className="camera-error">{error}</p>}

      <div className="camera-status">
        <p>
          Estado de cámara:{" "}
          <strong>{cameraOn ? "Activa" : "Inactiva"}</strong>
        </p>

        <p>
          Detección:{" "}
          <strong>
            {personDetected ? "Persona esperando" : "Parada vacía"}
          </strong>
        </p>
      </div>

      <button
        className={personDetected ? "btn-danger" : "btn-success"}
        onClick={() => setPersonDetected(!personDetected)}
      >
        {personDetected ? "Marcar parada vacía" : "Simular persona detectada"}
      </button>
    </div>
  );
}

export default CameraPanel;