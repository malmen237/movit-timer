const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Timer controls
  startTimer: () => ipcRenderer.invoke("start-timer"),
  stopTimer: () => ipcRenderer.invoke("stop-timer"),
  resetTimer: () => ipcRenderer.invoke("reset-timer"),
  setTimer: (minutes) => ipcRenderer.invoke("set-timer", minutes),
  getTimerStatus: () => ipcRenderer.invoke("get-timer-status"),

  // Popup controls
  closePopup: () => ipcRenderer.invoke("close-popup"),
  restartTimer: () => ipcRenderer.invoke("restart-timer"),
  forceClosePopup: () => ipcRenderer.invoke("force-close-popup"),

  // Event listeners
  onTimerUpdate: (callback) => ipcRenderer.on("timer-update", callback),
  onTimerStarted: (callback) => ipcRenderer.on("timer-started", callback),
  onTimerStopped: (callback) => ipcRenderer.on("timer-stopped", callback),
  onTimerReset: (callback) => ipcRenderer.on("timer-reset", callback),
  onTimerSleepResumed: (callback) =>
    ipcRenderer.on("timer-sleep-resumed", callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
