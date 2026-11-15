import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export const ADMIN_COOKIE = 'karkas_admin';

const sessions = new Map<string, { expiresAt: number }>();

type Bucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, Bucket>();

export function timingSafeStringEqual(left: string, right: string): boolean {
  const a = createHash('sha256').update(left).digest();
  const b = createHash('sha256').update(right).digest();
  return timingSafeEqual(a, b);
}

export function credentialsConfigured(): boolean {
  const login = process.env.ADMIN_LOGIN || '';
  const password = process.env.ADMIN_PASSWORD || '';
  return login.trim().length >= 3 && password.length >= 12;
}

export function adminLogin(): string {
  return (process.env.ADMIN_LOGIN || '').trim();
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || '';
}

export function isHttps(req: Request): boolean {
  if (req.secure) return true;
  if (process.env.TRUST_PROXY !== '1') return false;
  const proto = req.headers['x-forwarded-proto'];
  return proto === 'https' || (Array.isArray(proto) && proto[0] === 'https');
}

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export function writeSessionCookie(
  res: Response,
  token: string,
  maxAgeSec: number | null,
  secure: boolean
) {
  const parts = [
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
  ];
  if (maxAgeSec !== null) parts.push(`Max-Age=${maxAgeSec}`);
  if (secure) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response, secure: boolean) {
  const parts = [
    `${ADMIN_COOKIE}=`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function createSession(ttlMs: number): string {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { expiresAt: Date.now() + ttlMs });
  return token;
}

export function destroySession(token: string | null) {
  if (token) sessions.delete(token);
}

export function sessionIsValid(token: string | null): boolean {
  if (!token || token.length < 32) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

/** Cookie first. Bearer is accepted for non-browser clients. Query tokens are ignored. */
export function extractSessionToken(req: Request): string | null {
  const cookie = readCookie(req, ADMIN_COOKIE);
  if (cookie) return cookie;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function rateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (rateBuckets.size > 5000) {
      for (const [key, bucket] of rateBuckets) {
        if (bucket.resetAt <= now) rateBuckets.delete(key);
      }
    }
    const key = `${options.keyPrefix}:${clientIp(req)}`;
    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Слишком много запросов. Повторите попытку позже.',
        code: 'RATE_LIMITED',
      });
      return;
    }
    next();
  };
}

function contentSecurityPolicy(): string {
  const production = process.env.NODE_ENV === 'production';
  // Yandex Metrika is allowed only when a numeric counter id is configured (see src/utils/analytics.ts).
  const metrikaId = (process.env.VITE_YANDEX_METRIKA_ID || '').trim();
  const metrika = /^\d{4,12}$/.test(metrikaId) ? ' https://mc.yandex.ru' : '';
  const scriptSrc = production
    ? `script-src 'self'${metrika}`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectSrc = production ? `connect-src 'self'${metrika}` : "connect-src 'self' ws: wss:";
  const frameAncestors = (process.env.FRAME_ANCESTORS || '').trim();
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob:${metrika}`,
    connectSrc,
    "form-action 'self'",
    "frame-ancestors " + (frameAncestors || "'self'"),
  ];
  if (production) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', contentSecurityPolicy());
  const ancestors = (process.env.FRAME_ANCESTORS || '').trim();
  if (!ancestors || ancestors === "'self'") {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  if (process.env.NODE_ENV === 'production' && isHttps(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

export function corsGuard(req: Request, res: Response, next: NextFunction) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  const allowed = new Set(
    (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    if (origin && !allowed.has(origin)) {
      res.status(403).json({ error: 'Источник запроса не разрешён.', code: 'CORS_FORBIDDEN' });
      return;
    }
    res.status(204).end();
    return;
  }
  next();
}

export function apiErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
    return;
  }
  const error = err as { type?: string; status?: number; name?: string };
  if (error?.type === 'entity.too.large' || error?.status === 413) {
    res.status(413).json({ error: 'Слишком большой запрос.', code: 'PAYLOAD_TOO_LARGE' });
    return;
  }
  if (error?.name === 'SyntaxError' && error?.status === 400) {
    res.status(400).json({ error: 'Некорректное тело запроса.', code: 'BAD_JSON' });
    return;
  }
  console.error('[api] request failed');
  res.status(500).json({
    error: 'Внутренняя ошибка сервера. Повторите попытку позже.',
    code: 'INTERNAL',
  });
}
