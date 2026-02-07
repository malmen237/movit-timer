let pollingTimer = null;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener("message", (event) => {
  if (event.data === "start-polling") {
    startPolling();
  } else if (event.data === "stop-polling") {
    stopPolling();
  }
});

function startPolling() {
  stopPolling();
  pollingTimer = setInterval(async () => {
    try {
      const res = await fetch("/api/timer/status");
      const status = await res.json();
      if (status.expired) {
        stopPolling();
        self.registration.showNotification("Time to Move!", {
          body: "You've been working for a while. Get up and stretch!",
          icon: "/assets/icon.png",
          requireInteraction: true,
          tag: "break-reminder",
        });
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.postMessage("timer-expired");
        }
      }
    } catch (e) {}
  }, 5000);
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      }
    })
  );
});
