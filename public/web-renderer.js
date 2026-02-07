let timeRemaining = 60 * 60;
let isTimerRunning = false;
let selectedDuration = 60 * 60;
let hasAlerted = false;
let pollInterval = null;
let titleInterval = null;
let alarmInterval = null;

const timeDisplay = document.getElementById("timeDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const durationSelect = document.getElementById("duration");
const popup = document.getElementById("breakPopup");
const restartBtn = document.getElementById("restartBtn");
const dismissBtn = document.getElementById("dismissBtn");

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(timeRemaining);
  startBtn.disabled = isTimerRunning;
  stopBtn.disabled = !isTimerRunning;
  statusDisplay.textContent = isTimerRunning ? "Timer running..." : "Ready to start";
}

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`/api/timer/${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    return { success: false };
  }
}

function tellServiceWorker(message) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(async () => {
    const status = await apiCall("status");
    if (status.success === false) return;

    timeRemaining = status.timeRemaining;
    isTimerRunning = status.isRunning;
    selectedDuration = status.selectedDuration;
    updateDisplay();

    if (status.expired && !hasAlerted) {
      hasAlerted = true;
      showBreakAlert();
    }
  }, 1000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function startTimer() {
  const result = await apiCall("start", { method: "POST" });
  if (result.success) {
    hasAlerted = false;
    startPolling();
    tellServiceWorker("start-polling");
  }
}

async function stopTimer() {
  const result = await apiCall("stop", { method: "POST" });
  if (result.success) {
    tellServiceWorker("stop-polling");
  }
}

async function resetTimer() {
  const result = await apiCall("reset", { method: "POST" });
  if (result.success) {
    hasAlerted = false;
    hideBreakPopup();
    tellServiceWorker("stop-polling");
  }
}

async function setTimerDuration(minutes) {
  const result = await apiCall("set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutes }),
  });
  if (result.success) {
    hasAlerted = false;
  }
}

// --- Alarm sound ---

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playAlarmBurst() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    function tone(start, freq, duration, volume) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.setValueAtTime(volume, start + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);

      osc.onended = () => {
        gain.disconnect();
        osc.disconnect();
      };
    }

    tone(now, 880, 0.15, 0.5);
    tone(now + 0.2, 1100, 0.15, 0.5);
    tone(now + 0.4, 880, 0.15, 0.5);
    tone(now + 0.6, 1100, 0.15, 0.5);
    tone(now + 1.0, 660, 0.4, 0.4);
  } catch (e) {
    console.error("Audio alert failed:", e);
  }
}

function startAlarmLoop() {
  stopAlarmLoop();
  playAlarmBurst();
  alarmInterval = setInterval(playAlarmBurst, 4000);
}

function stopAlarmLoop() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

// --- Title flash ---

function startTitleFlash() {
  stopTitleFlash();
  let flash = false;
  titleInterval = setInterval(() => {
    document.title = flash ? "Movit Timer" : "TIME TO MOVE!";
    flash = !flash;
  }, 1000);
}

function stopTitleFlash() {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
    document.title = "Movit Timer";
  }
}

// --- Break popup ---

function showBreakPopup() {
  popup.classList.add("visible");
}

function hideBreakPopup() {
  popup.classList.remove("visible");
  stopTitleFlash();
  stopAlarmLoop();
}

function showBreakAlert() {
  startAlarmLoop();
  startTitleFlash();
  showBreakPopup();
}

async function handleRestart() {
  const result = await apiCall("restart", { method: "POST" });
  if (result.success) {
    hasAlerted = false;
    hideBreakPopup();
    tellServiceWorker("start-polling");
  }
}

async function handleDismiss() {
  const result = await apiCall("dismiss", { method: "POST" });
  if (result.success) {
    hasAlerted = false;
    hideBreakPopup();
    tellServiceWorker("stop-polling");
  }
}

// --- Event listeners ---

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
restartBtn.addEventListener("click", handleRestart);
dismissBtn.addEventListener("click", handleDismiss);

durationSelect.addEventListener("change", (e) => {
  setTimerDuration(parseInt(e.target.value));
});

window.addEventListener("beforeunload", () => {
  stopAlarmLoop();
  stopPolling();
  if (audioCtx && audioCtx.state !== "closed") {
    audioCtx.close();
  }
});

// --- Init ---

document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.register("/sw.js");
    reg.update();
    await navigator.serviceWorker.ready;

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data === "timer-expired" && !hasAlerted) {
        hasAlerted = true;
        showBreakAlert();
      }
    });
  }

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  const status = await apiCall("status");
  if (status.success !== false) {
    timeRemaining = status.timeRemaining;
    isTimerRunning = status.isRunning;
    selectedDuration = status.selectedDuration;
    updateDisplay();

    if (status.expired && !hasAlerted) {
      hasAlerted = true;
      showBreakAlert();
    }

    if (status.isRunning) {
      tellServiceWorker("start-polling");
    }
  }

  startPolling();
});
