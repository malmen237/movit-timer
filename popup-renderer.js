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
    window.electronAPI.restartTimer();
  });

  closeBtn.addEventListener("click", () => {
    console.log("Close button clicked");
    window.electronAPI.closePopup();
  });

  // Add some visual feedback
  restartBtn.addEventListener("mouseenter", () => {
    restartBtn.style.transform = "translateY(-3px) scale(1.05)";
  });

  restartBtn.addEventListener("mouseleave", () => {
    restartBtn.style.transform = "translateY(0) scale(1)";
  });

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.transform = "translateY(-3px) scale(1.05)";
  });

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.transform = "translateY(0) scale(1)";
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
});
