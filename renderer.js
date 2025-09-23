// Use the secure electronAPI from preload script

let currentTime = 60 * 60; // Default 1 hour in seconds
let isRunning = false;

// DOM elements
const timeDisplay = document.getElementById("timeDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const durationSelect = document.getElementById("duration");

// Initialize
updateDisplay();
loadTimerStatus();

// Event listeners
startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
durationSelect.addEventListener("change", updateDuration);

// IPC listeners using secure electronAPI
window.electronAPI.onTimerUpdate((event, timeRemaining) => {
  currentTime = timeRemaining;
  updateDisplay();
});

window.electronAPI.onTimerStarted(() => {
  isRunning = true;
  updateButtons();
  statusDisplay.textContent = "Timer running...";
});

window.electronAPI.onTimerStopped(() => {
  isRunning = false;
  updateButtons();
  statusDisplay.textContent = "Timer stopped";
});

window.electronAPI.onTimerReset((event, timeRemaining) => {
  currentTime = timeRemaining;
  isRunning = false;
  updateDisplay();
  updateButtons();
  statusDisplay.textContent = "Timer reset";
});

window.electronAPI.onTimerSleepResumed((event, data) => {
  console.log("Timer sleep resumed:", data);
  if (data.wasRunning) {
    statusDisplay.textContent = `Timer was auto-stopped during sleep (${Math.floor(
      data.sleepDuration / 60
    )} min sleep)`;
  }
});

function startTimer() {
  window.electronAPI.startTimer();
  isRunning = true;
  updateButtons();
  statusDisplay.textContent = "Timer running...";
}

function stopTimer() {
  window.electronAPI.stopTimer();
  isRunning = false;
  updateButtons();
  statusDisplay.textContent = "Timer stopped";
}

function resetTimer() {
  window.electronAPI.resetTimer();
  isRunning = false;
  updateButtons();
  statusDisplay.textContent = "Timer reset";
}

function updateDuration() {
  const minutes = parseInt(durationSelect.value);
  window.electronAPI.setTimer(minutes);
  currentTime = minutes * 60;
  updateDisplay();
  statusDisplay.textContent = `Timer set to ${minutes} minutes`;
}

function updateDisplay() {
  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  timeDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function updateButtons() {
  startBtn.disabled = isRunning;
  stopBtn.disabled = !isRunning;
}

async function loadTimerStatus() {
  try {
    const status = await window.electronAPI.getTimerStatus();
    currentTime = status.timeRemaining;
    isRunning = status.isRunning;
    updateDisplay();
    updateButtons();

    if (isRunning) {
      statusDisplay.textContent = "Timer running...";
    } else {
      statusDisplay.textContent = "Ready to start";
    }
  } catch (error) {
    console.error("Error loading timer status:", error);
  }
}
