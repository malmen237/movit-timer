const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8090;

// Serve static files
app.use(express.static("."));

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoints for timer functionality
let timeRemaining = 60 * 60; // Default 1 hour in seconds
let selectedDuration = 60 * 60;
let isTimerRunning = false;
let timerInterval = null;

app.get("/api/timer/status", (req, res) => {
  res.json({
    timeRemaining,
    isRunning: isTimerRunning,
    selectedDuration,
  });
});

app.post("/api/timer/start", (req, res) => {
  if (isTimerRunning) {
    return res.json({ success: false, message: "Timer already running" });
  }

  isTimerRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
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
  timeRemaining = selectedDuration;
  res.json({ success: true });
});

app.post("/api/timer/set", (req, res) => {
  const minutes = parseInt(req.query.minutes) || 60;
  selectedDuration = minutes * 60;
  timeRemaining = selectedDuration;
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
  console.log(`Timer app running on port ${port}`);
});
