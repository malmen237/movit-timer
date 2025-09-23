// Use the secure electronAPI from preload script

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const restartBtn = document.getElementById("restartBtn");
  const closeBtn = document.getElementById("closeBtn");

  // Check if electronAPI is available
  if (!window.electronAPI) {
    console.error("electronAPI not available");
    return;
  }

  // Event listeners
  restartBtn.addEventListener("click", () => {
    console.log("Restart button clicked");
    try {
      window.electronAPI.restartTimer();
    } catch (error) {
      console.error("Error restarting timer:", error);
      // Fallback: try to force close and restart
      window.electronAPI.forceClosePopup();
    }
  });

  closeBtn.addEventListener("click", () => {
    console.log("Close button clicked");
    try {
      window.electronAPI.closePopup();
    } catch (error) {
      console.error("Error closing popup:", error);
      // Fallback: try to force close
      window.electronAPI.forceClosePopup();
    }
  });

  // Add some visual feedback
  restartBtn.addEventListener("mouseenter", () => {
    restartBtn.classList.add("btn-hover");
    restartBtn.classList.remove("btn-normal");
  });

  restartBtn.addEventListener("mouseleave", () => {
    restartBtn.classList.add("btn-normal");
    restartBtn.classList.remove("btn-hover");
  });

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.classList.add("btn-hover");
    closeBtn.classList.remove("btn-normal");
  });

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.classList.add("btn-normal");
    closeBtn.classList.remove("btn-hover");
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      restartBtn.click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeBtn.click();
    }
  });

  // Focus the restart button by default
  restartBtn.focus();

  // Add timeout mechanism to prevent stuck popups
  // If no interaction for 5 minutes, auto-close the popup
  let inactivityTimer = setTimeout(() => {
    console.log("Popup timeout - auto-closing due to inactivity");
    try {
      window.electronAPI.forceClosePopup();
    } catch (error) {
      console.error("Error in timeout close:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Reset timeout on any interaction
  const resetTimeout = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.log("Popup timeout - auto-closing due to inactivity");
      try {
        window.electronAPI.forceClosePopup();
      } catch (error) {
        console.error("Error in timeout close:", error);
      }
    }, 5 * 60 * 1000);
  };

  // Reset timeout on any user interaction
  document.addEventListener("click", resetTimeout);
  document.addEventListener("keydown", resetTimeout);
  document.addEventListener("mousemove", resetTimeout);
});
