// Registers the service worker in production builds only (dev servers and hot reload stay untouched).
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => { /* installability is optional */ });
}
