// Web version of the renderer
let timeRemaining = 60 * 60;
let isTimerRunning = false;
let selectedDuration = 60 * 60;

const timeDisplay = document.getElementById("timeDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const durationSelect = document.getElementById("duration");

// Format time as HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Update display
function updateDisplay() {
  timeDisplay.textContent = formatTime(timeRemaining);

  if (isTimerRunning) {
    statusDisplay.textContent = "Timer running...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusDisplay.textContent = "Ready to start";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// API calls
async function apiCall(endpoint, method = "GET") {
  try {
    const response = await fetch(`/api/timer/${endpoint}`, { method });
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    return { success: false };
  }
}

// Load timer status
async function loadTimerStatus() {
  const status = await apiCall("status");
  if (status.success !== false) {
    timeRemaining = status.timeRemaining;
    isTimerRunning = status.isRunning;
    selectedDuration = status.selectedDuration;
    updateDisplay();
  }
}

// Start timer
async function startTimer() {
  const result = await apiCall("start", "POST");
  if (result.success) {
    isTimerRunning = true;
    updateDisplay();
    startTimerLoop();
  }
}

// Stop timer
async function stopTimer() {
  const result = await apiCall("stop", "POST");
  if (result.success) {
    isTimerRunning = false;
    updateDisplay();
  }
}

// Reset timer
async function resetTimer() {
  const result = await apiCall("reset", "POST");
  if (result.success) {
    timeRemaining = selectedDuration;
    isTimerRunning = false;
    updateDisplay();
  }
}

// Set timer duration
async function setTimerDuration(minutes) {
  const result = await apiCall(`set?minutes=${minutes}`, "POST");
  if (result.success) {
    selectedDuration = minutes * 60;
    timeRemaining = selectedDuration;
    updateDisplay();
  }
}

// Timer loop for web version
function startTimerLoop() {
  if (!isTimerRunning) return;

  const interval = setInterval(async () => {
    if (!isTimerRunning) {
      clearInterval(interval);
      return;
    }

    timeRemaining--;
    updateDisplay();

    if (timeRemaining <= 0) {
      isTimerRunning = false;
      clearInterval(interval);
      updateDisplay();
      showBreakNotification();
    }
  }, 1000);
}

// Show break notification
function showBreakNotification() {
  if (Notification.permission === "granted") {
    new Notification("Time for a break!", {
      body: "You've been working for a while. Time to move around!",
      icon: "/assets/icon.png",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Time for a break!", {
          body: "You've been working for a while. Time to move around!",
          icon: "/assets/icon.png",
        });
      }
    });
  }

  // Also show browser alert as fallback
  alert(
    "Time for a break! You've been working for a while. Time to move around!"
  );
}

// Event listeners
startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);

durationSelect.addEventListener("change", (e) => {
  const minutes = parseInt(e.target.value);
  setTimerDuration(minutes);
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadTimerStatus();

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
