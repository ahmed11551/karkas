/**
 * Yandex Metrika counter (optional) plus a small product-event adapter.
 *
 * Enabled only when VITE_YANDEX_METRIKA_ID holds a numeric counter id AND the build is production.
 * Without an id nothing is loaded: no script, no requests, no cookies.
 *
 * The official inline snippet is not used because the CSP forbids inline scripts. Instead the
 * same queue stub is created here and tag.js is loaded from mc.yandex.ru (allowed by the server CSP
 * only when the id is set, see server/httpSecurity.ts).
 */

type YmFn = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

declare global {
  interface Window {
    ym?: YmFn;
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent =
  | 'view_project'
  | 'calc_start'
  | 'calc_complete'
  | 'quiz_start'
  | 'quiz_complete'
  | 'lead_submit'
  | 'crm_status_change';

const rawId = (import.meta.env.VITE_YANDEX_METRIKA_ID as string | undefined) ?? '';
const counterId = /^\d{4,12}$/.test(rawId.trim()) ? Number(rawId.trim()) : null;

let initialized = false;

/** Loads the counter once. Safe to call on every app start. */
export function initAnalytics(): void {
  if (initialized || !import.meta.env.PROD || counterId === null || typeof window === 'undefined') {
    return;
  }
  initialized = true;

  if (!window.ym) {
    const queue: unknown[][] = [];
    const stub = ((...args: unknown[]) => {
      queue.push(args);
    }) as YmFn;
    stub.a = queue;
    stub.l = Date.now();
    window.ym = stub;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);

  window.ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  });
}

/** Sends a goal (must be created in Metrika: Settings → Goals). No-op when analytics is off. */
export function reachGoal(target: string): void {
  if (!import.meta.env.PROD || counterId === null || typeof window === 'undefined' || !window.ym) {
    return;
  }
  window.ym(counterId, 'reachGoal', target);
}

/** Product event: always available on window, and forwarded to Metrika when the counter is on. */
export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === 'undefined') return;
  const detail: Record<string, unknown> = { event };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') detail[key] = value;
  }
  window.dispatchEvent(new CustomEvent('karkas:analytics', { detail }));
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(detail);
  reachGoal(event);
}
