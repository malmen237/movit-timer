const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
} = require("electron");
const path = require("path");

let mainWindow;
let tray;
let popupWindow;
let timerInterval;
let timeRemaining = 60 * 60; // Default 1 hour in seconds
let selectedDuration = 60 * 60; // Store the selected duration
let isTimerRunning = false;
let isQuiting = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    resizable: false,
    titleBarStyle: "hidden",
  });

  mainWindow.loadFile("index.html");

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createPopupWindow() {
  popupWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    alwaysOnTop: true,
    fullscreen: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
  });

  popupWindow.loadFile("popup.html");
  popupWindow.setAlwaysOnTop(true, "screen-saver");
  popupWindow.show();
  popupWindow.focus();
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.png");
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    // Create a simple icon if file doesn't exist
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Timer",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Start Timer",
      click: () => {
        startTimer();
      },
    },
    {
      label: "Stop Timer",
      click: () => {
        stopTimer();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Movit Timer - Click to show");

  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function startTimer() {
  if (isTimerRunning) return;

  isTimerRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;

    if (mainWindow) {
      mainWindow.webContents.send("timer-update", timeRemaining);
    }

    if (timeRemaining <= 0) {
      stopTimer();
      createPopupWindow();
    }
  }, 1000);
}

function stopTimer() {
  if (!isTimerRunning) return;

  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (mainWindow) {
    mainWindow.webContents.send("timer-stopped");
  }
}

function resetTimer() {
  stopTimer();
  timeRemaining = selectedDuration; // Reset to selected duration
  if (mainWindow) {
    mainWindow.webContents.send("timer-reset", timeRemaining);
  }
}

// IPC handlers
ipcMain.handle("start-timer", () => {
  startTimer();
});

ipcMain.handle("stop-timer", () => {
  stopTimer();
});

ipcMain.handle("reset-timer", () => {
  resetTimer();
});

ipcMain.handle("set-timer", (event, minutes) => {
  selectedDuration = minutes * 60; // Store the selected duration
  timeRemaining = selectedDuration;
  if (mainWindow) {
    mainWindow.webContents.send("timer-update", timeRemaining);
  }
});

ipcMain.handle("get-timer-status", () => {
  return {
    timeRemaining,
    isRunning: isTimerRunning,
  };
});

ipcMain.handle("close-popup", () => {
  if (popupWindow) {
    popupWindow.close();
    popupWindow = null;
  }
  // Reset timer to selected duration when closing without restart
  timeRemaining = selectedDuration;
  if (mainWindow) {
    mainWindow.webContents.send("timer-reset", timeRemaining);
  }
});

ipcMain.handle("restart-timer", () => {
  if (popupWindow) {
    popupWindow.close();
    popupWindow = null;
  }
  resetTimer();
  startTimer();
});

app.whenReady().then(() => {
  createMainWindow();
  createTray();
});

// Handle dock click on macOS
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuiting = true;
});
