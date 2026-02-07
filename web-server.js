const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8090;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let timeRemaining = 60 * 60;
let selectedDuration = 60 * 60;
let isTimerRunning = false;
let timerInterval = null;
let expired = false;

function startTimerInterval() {
  stopTimer();
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
}

function stopTimer() {
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

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
  startTimerInterval();
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
  const minutes = parseInt(req.body.minutes);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 480) {
    return res.status(400).json({ success: false, message: "Invalid minutes (1-480)" });
  }
  stopTimer();
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
  timeRemaining = selectedDuration;
  startTimerInterval();
  res.json({ success: true });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Movit Timer running on port ${port}`);
});
