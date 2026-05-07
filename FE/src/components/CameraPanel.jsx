import { useEffect, useRef, useState } from "react";

function CameraPanel() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const stopCurrentCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const loadCameras = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );

      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError("No se pudieron cargar las cámaras disponibles.");
      console.error(err);
    }
  };

  const startCamera = async (deviceId = selectedDeviceId) => {
    try {
      stopCurrentCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setError("");

      await loadCameras();
    } catch (err) {
      setCameraOn(false);
      setError("No se pudo acceder a la cámara. Revisa permisos del navegador.");
      console.error(err);
    }
  };

  const handleCameraChange = (e) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);
    startCamera(deviceId);
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCurrentCamera();
    };
  }, []);

  return (
    <div className="camera-panel">
      <h2>Cámara de la parada</h2>

      {devices.length > 0 && (
        <div className="camera-selector">
          <label>Seleccionar cámara: </label>
          <select value={selectedDeviceId} onChange={handleCameraChange}>
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Cámara ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

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