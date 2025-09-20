# Movit Timer

A desktop timer application to remind you to take breaks and move around during long work sessions.

## Features

- ⏰ Customizable timer duration (15 min to 2 hours)
- 🚨 Full-screen blocking popup when timer expires
- 🎯 System tray integration for easy access
- 🔄 One-click restart functionality
- 💡 Movement suggestions in the popup
- ⌨️ Keyboard shortcuts (Enter to restart, Escape to close)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

## Usage

1. **Start the timer**: Choose your desired duration and click "Start Timer"
2. **Work normally**: The timer runs in the background
3. **Take a break**: When the timer expires, a full-screen popup will appear
4. **Restart**: After moving around, click "Restart Timer" to start again

## System Tray

The app runs in your system tray. Right-click the tray icon to:
- Show/hide the timer window
- Start/stop the timer
- Quit the application

## Keyboard Shortcuts (in popup)

- **Enter** or **Space**: Restart timer
- **Escape**: Close popup without restarting

## Default Settings

- Default timer: 1 hour
- Available durations: 15, 30, 45, 60, 90, 120 minutes
- Popup is always on top and full-screen
