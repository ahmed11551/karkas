/**
 * Registers the offline service worker (public/sw.js) in production builds only.
 * In development a service worker would cache stale modules and confuse HMR.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
      console.warn('[pwa] service worker registration failed', error);
    });
  });
}
