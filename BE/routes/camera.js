const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

const RTSP_URL = "rtsp://admin:Raul2005@192.168.1.1:554//main";

router.get("/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace;boundary=ffserver",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const ffmpeg = spawn("ffmpeg", [
    "-rtsp_transport", "tcp",
    "-i", RTSP_URL,
    "-f", "mpjpeg",
    "-q:v", "5",
    "-r", "15",
    "-"
  ]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.on("error", (err) => {
    console.error("[Camera] ffmpeg spawn error:", err.message);
    res.end();
  });

  ffmpeg.stderr.on("data", () => {}); // ffmpeg logs to stderr normally

  req.on("close", () => {
    ffmpeg.kill("SIGTERM");
  });
});

module.exports = router;
