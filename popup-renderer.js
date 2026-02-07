document.addEventListener("DOMContentLoaded", () => {
  const restartBtn = document.getElementById("restartBtn");
  const closeBtn = document.getElementById("closeBtn");

  if (!window.electronAPI) {
    console.error("electronAPI not available");
    return;
  }

  let audioCtx = null;
  let alarmInterval = null;

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

  function startAlarm() {
    playAlarmBurst();
    alarmInterval = setInterval(playAlarmBurst, 4000);
  }

  function stopAlarm() {
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
  }

  startAlarm();

  restartBtn.addEventListener("click", () => {
    stopAlarm();
    try {
      window.electronAPI.restartTimer();
    } catch (error) {
      console.error("Error restarting timer:", error);
      window.electronAPI.forceClosePopup();
    }
  });

  closeBtn.addEventListener("click", () => {
    stopAlarm();
    try {
      window.electronAPI.closePopup();
    } catch (error) {
      console.error("Error closing popup:", error);
      window.electronAPI.forceClosePopup();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      restartBtn.click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeBtn.click();
    }
  });

  restartBtn.focus();

  let inactivityTimer = setTimeout(() => {
    stopAlarm();
    try {
      window.electronAPI.forceClosePopup();
    } catch (error) {
      console.error("Error in timeout close:", error);
    }
  }, 5 * 60 * 1000);

  const resetTimeout = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      stopAlarm();
      try {
        window.electronAPI.forceClosePopup();
      } catch (error) {
        console.error("Error in timeout close:", error);
      }
    }, 5 * 60 * 1000);
  };

  document.addEventListener("click", resetTimeout);
  document.addEventListener("keydown", resetTimeout);
  document.addEventListener("mousemove", resetTimeout);
});
