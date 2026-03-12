// Firebase Cloud Messaging Service Worker
// Handles push notifications when the dashboard is in the background

self.addEventListener("push", (event) => {
  const data = event.data?.json();

  if (data?.notification) {
    const { title, body, icon } = data.notification;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: icon || "/pho-icon.svg",
        badge: "/pho-icon.svg",
        vibrate: [200, 100, 200],
        data: data.data || {},
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const orderId = event.notification.data?.order_id;
  const url = orderId ? `/dashboard?order=${orderId}` : "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
