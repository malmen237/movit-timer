const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8090;

app.use(express.static("."));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let timeRemaining = 60 * 60;
let selectedDuration = 60 * 60;
let isTimerRunning = false;
let timerInterval = null;
let expired = false;

app.get("/api/timer/status", (req, res) => {
  res.json({
    timeRemaining,
    isRunning: isTimerRunning,
    selectedDuration,
    expired,
  });
});

app.post("/api/timer/start", (req, res) => {
  if (isTimerRunning) {
    return res.json({ success: false, message: "Timer already running" });
  }

  expired = false;
  isTimerRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      expired = true;
      stopTimer();
    }
  }, 1000);

  res.json({ success: true });
});

app.post("/api/timer/stop", (req, res) => {
  stopTimer();
  res.json({ success: true });
});

app.post("/api/timer/reset", (req, res) => {
  stopTimer();
  expired = false;
  timeRemaining = selectedDuration;
  res.json({ success: true });
});

app.post("/api/timer/set", (req, res) => {
  const minutes = parseInt(req.query.minutes) || 60;
  selectedDuration = minutes * 60;
  timeRemaining = selectedDuration;
  expired = false;
  res.json({ success: true });
});

app.post("/api/timer/dismiss", (req, res) => {
  expired = false;
  timeRemaining = selectedDuration;
  res.json({ success: true });
});

app.post("/api/timer/restart", (req, res) => {
  stopTimer();
  expired = false;
  timeRemaining = selectedDuration;
  isTimerRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      expired = true;
      stopTimer();
    }
  }, 1000);
  res.json({ success: true });
});

function stopTimer() {
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

app.listen(port, () => {
  console.log(`Movit Timer running on port ${port}`);
});
