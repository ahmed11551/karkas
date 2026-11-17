import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { parsePublicLead, sanitizeManagerNotes, sanitizePlainText, validateClientName } from './src/utils/leadPayload.ts';
import { notifyTelegramNewLead, telegramEnabled } from './server/telegram.ts';
import {
  adminLogin,
  adminPassword,
  apiErrorHandler,
  clearSessionCookie,
  corsGuard,
  createSession,
  credentialsConfigured,
  destroySession,
  extractSessionToken,
  isHttps,
  rateLimit,
  securityHeaders,
  sessionIsValid,
  timingSafeStringEqual,
  writeSessionCookie,
} from './server/httpSecurity.ts';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const REMEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Point DATA_DIR at a persistent volume in production, otherwise leads are lost on redeploy.
const DATA_DIR = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.resolve(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

export const LEAD_STATUSES = ['new', 'contacted', 'negotiation', 'contract', 'completed', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Every field is optional: only values the client actually sent are stored. */
export interface LeadCalculatorParams {
  size?: number; // e.g. 36 m²
  insulation?: string; // e.g. '150 мм (Осень-Зима)'
  foundation?: string; // e.g. 'Свайно-винтовой (−50%)'
  veranda?: string; // e.g. 'С верандой' | 'Без веранды'
  distanceKm?: number; // e.g. 45 км от МКАД
  mortgageMode?: boolean;
  monthlyPayment?: number;
}

export interface CalculationHistoryItem {
  timestamp: string;
  action: string;
  houseTitle?: string;
  calculatedPrice?: number;
  size?: number;
  insulation?: string;
  foundation?: string;
  veranda?: string;
  distanceKm?: number;
}

export interface ServerLead {
  id: string;
  timestamp: string;
  createdAtMs: number;
  source: 'hero_quick' | 'quiz_modal' | 'calculator' | 'catalog_spec';
  clientName?: string;
  phone: string;
  houseTitle?: string;
  calculatedPrice?: number;
  status: LeadStatus;
  /** Manager's follow-up date (YYYY-MM-DD, local). Empty when no callback is planned. */
  followUpAt?: string;
  calculatorParams?: LeadCalculatorParams;
  calculationHistory?: CalculationHistoryItem[];
  giftsSelected?: string[];
  quizAnswers?: { [key: string]: string };
  utm?: { [key: string]: string };
  managerNotes?: string;
}

// Connected SSE clients for real-time lead notifications
const sseClients = new Set<Response>();

// No seed data: the CRM starts empty. Demo leads with invented names and phones are never written.
const INITIAL_LEADS: ServerLead[] = [];

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

function normalizeStatus(st?: string): LeadStatus {
  if (st === 'in_progress') return 'contacted';
  if (st === 'done') return 'completed';
  return isLeadStatus(st) ? st : 'new';
}

const FOLLOW_UP_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function ensureLeadsFile(): ServerLead[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(INITIAL_LEADS, null, 2), 'utf-8');
      return INITIAL_LEADS;
    }
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: ServerLead) => ({
        ...item,
        status: normalizeStatus(item.status),
      }));
    }
    return INITIAL_LEADS;
  } catch {
    return INITIAL_LEADS;
  }
}

function saveLeadsToDisk(leads: ServerLead[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch {
    // Keep the request successful, but make data loss visible in platform logs (no personal data here).
    console.error('[leads] failed to write leads file. Check DATA_DIR and that the volume is writable.');
  }
}

let leadsStore: ServerLead[] = ensureLeadsFile();

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  if (!sessionIsValid(token)) {
    res.status(403).json({
      error: 'Доступ запрещён. Нужна действующая сессия администратора.',
      code: 'FORBIDDEN_ADMIN_TOKEN_REQUIRED',
    });
    return;
  }
  next();
}

function newLeadId(): string {
  return `LD-${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function startServer() {
  if (process.env.NODE_ENV === 'production' && !credentialsConfigured()) {
    throw new Error('ADMIN_LOGIN and ADMIN_PASSWORD (12+ chars) are required in production.');
  }
  if (!credentialsConfigured()) {
    console.warn('[auth] ADMIN_LOGIN / ADMIN_PASSWORD are not set. Admin login is disabled.');
  }
  console.info(
    telegramEnabled()
      ? '[telegram] new-lead notifications enabled'
      : '[telegram] new-lead notifications disabled (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set or invalid)'
  );

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
  app.use(securityHeaders);
  app.use(corsGuard);
  app.use(express.json({ limit: '16kb' }));

  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: 'login' });
  const leadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 12, keyPrefix: 'leads' });

  // Public health check for hosting platforms (Railway, Render). No data, no auth.
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // 1. Admin Login Endpoint (/api/auth/login)
  app.post('/api/auth/login', loginLimiter, (req: Request, res: Response) => {
    if (!credentialsConfigured()) {
      res.status(503).json({ error: 'Вход администратора временно недоступен.', code: 'AUTH_DISABLED' });
      return;
    }
    const username = sanitizePlainText(req.body?.username, 64);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';
    const remember = req.body?.remember === true;
    const userOk = timingSafeStringEqual(username, adminLogin());
    const passOk = timingSafeStringEqual(password, adminPassword());
    if (!userOk || !passOk) {
      res.status(401).json({ error: 'Неверный логин или пароль администратора.', code: 'INVALID_CREDENTIALS' });
      return;
    }
    const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
    const token = createSession(ttl);
    writeSessionCookie(res, token, remember ? Math.floor(ttl / 1000) : null, isHttps(req));
    res.status(200).json({
      success: true,
      user: { username: adminLogin(), role: 'Руководитель отдела продаж' },
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    destroySession(extractSessionToken(req));
    clearSessionCookie(res, isHttps(req));
    res.status(200).json({ success: true });
  });

  // 2. Verify Admin Session (/api/auth/verify)
  app.get('/api/auth/verify', (req: Request, res: Response) => {
    if (!sessionIsValid(extractSessionToken(req))) {
      res.status(403).json({
        authenticated: false,
        error: 'Доступ запрещён. Сессия администратора недействительна.',
        code: 'FORBIDDEN_ADMIN_TOKEN_REQUIRED',
      });
      return;
    }
    res.status(200).json({
      authenticated: true,
      user: { username: adminLogin(), role: 'Руководитель отдела продаж' },
    });
  });

  // 3. Real-Time SSE Stream for Admin Notifications (/api/leads/stream)
  app.get('/api/leads/stream', requireAdminAuth, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'ok' })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // 4. Protected GET /api/leads (Returns 403 Forbidden without admin_token)
  app.get('/api/leads', requireAdminAuth, (_req: Request, res: Response) => {
    res.status(200).json({
      leads: leadsStore,
      total: leadsStore.length,
    });
  });

  // 5. Public POST /api/leads — schema-validated, server-assigned id and status
  app.post('/api/leads', leadLimiter, (req: Request, res: Response) => {
    const parsed = parsePublicLead(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error, code: parsed.code });
      return;
    }

    const lead = parsed.lead;
    const nowFormatted = new Date().toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const calcParams = lead.calculatorParams;
    const historyEntry: CalculationHistoryItem = {
      timestamp: nowFormatted,
      action:
        lead.source === 'calculator'
          ? 'Фиксация цены в калькуляторе'
          : lead.source === 'quiz_modal'
            ? 'Завершение квиза'
            : 'Быстрая заявка (без расчёта)',
      houseTitle: lead.houseTitle,
      calculatedPrice: lead.calculatedPrice,
      ...calcParams,
    };

    const newLead: ServerLead = {
      id: newLeadId(),
      timestamp: nowFormatted,
      createdAtMs: Date.now(),
      source: lead.source,
      clientName: lead.clientName,
      phone: lead.phone,
      houseTitle: lead.houseTitle,
      calculatedPrice: lead.calculatedPrice,
      status: 'new',
      calculatorParams: calcParams,
      calculationHistory: [historyEntry],
      giftsSelected: lead.giftsSelected,
      quizAnswers: lead.quizAnswers,
      utm: lead.utm,
      managerNotes: '',
    };

    leadsStore = [newLead, ...leadsStore];
    saveLeadsToDisk(leadsStore);

    // Broadcast immediately via SSE to all logged-in admins
    const payload = JSON.stringify(newLead);
    sseClients.forEach((client) => {
      try {
        client.write(`event: new_lead\ndata: ${payload}\n\n`);
      } catch {
        sseClients.delete(client);
      }
    });

    // Fire-and-forget: Telegram latency or failure must not affect the client response.
    void notifyTelegramNewLead(newLead);

    res.status(201).json({ lead: newLead });
  });

  // 6. Protected PATCH /api/leads/:id (status, notes, client name, follow-up date).
  // Invalid values are rejected with 400; the client must never believe a change was saved when it was not.
  app.patch('/api/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^LD-[A-F0-9]{8}$/.test(id) && !/^LD-[A-Z0-9]{5}$/.test(id)) {
      res.status(400).json({ error: 'Некорректный идентификатор заявки.', code: 'INVALID_ID' });
      return;
    }
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;

    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Лид не найден', code: 'NOT_FOUND' });
      return;
    }

    if (body.status !== undefined && !isLeadStatus(body.status)) {
      res.status(400).json({ error: 'Неизвестный статус заявки.', code: 'INVALID_STATUS' });
      return;
    }

    let followUpAt: string | undefined | null;
    if (body.followUpAt !== undefined) {
      if (body.followUpAt === null || body.followUpAt === '') {
        followUpAt = null;
      } else if (typeof body.followUpAt === 'string' && FOLLOW_UP_PATTERN.test(body.followUpAt)) {
        followUpAt = body.followUpAt;
      } else {
        res.status(400).json({ error: 'Некорректная дата перезвона.', code: 'INVALID_FOLLOW_UP' });
        return;
      }
    }

    const notes = sanitizeManagerNotes(body.managerNotes);
    let nextName: string | undefined;
    if (typeof body.clientName === 'string') {
      const nameCheck = validateClientName(body.clientName, 'ru');
      if (!nameCheck.ok) {
        res.status(400).json({ error: nameCheck.error, code: 'INVALID_NAME' });
        return;
      }
      nextName = nameCheck.value || leadsStore[idx].clientName;
    }

    const current = leadsStore[idx];
    const updated: ServerLead = {
      ...current,
      ...(body.status !== undefined ? { status: body.status as LeadStatus } : {}),
      ...(notes !== null ? { managerNotes: notes } : {}),
      ...(nextName !== undefined ? { clientName: nextName } : {}),
    };
    if (followUpAt !== undefined) {
      if (followUpAt === null) {
        delete updated.followUpAt;
      } else {
        updated.followUpAt = followUpAt;
      }
    }

    leadsStore[idx] = updated;
    saveLeadsToDisk(leadsStore);

    res.status(200).json({ lead: updated });
  });

  // 7. Protected DELETE /api/leads/:id (Delete single lead — 403 without token)
  app.delete('/api/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^LD-[A-F0-9]{8}$/.test(id) && !/^LD-[A-Z0-9]{5}$/.test(id)) {
      res.status(400).json({ error: 'Некорректный идентификатор заявки.', code: 'INVALID_ID' });
      return;
    }
    const before = leadsStore.length;
    leadsStore = leadsStore.filter((l) => l.id !== id);
    if (leadsStore.length === before) {
      res.status(404).json({ error: 'Лид не найден', code: 'NOT_FOUND' });
      return;
    }
    saveLeadsToDisk(leadsStore);
    res.status(200).json({ success: true, total: leadsStore.length });
  });

  app.use('/api', apiErrorHandler);

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 4 syntax: '*' (not '*all', which is Express 5). Without this, deep links such as /login 404.
    app.get('*', (req: Request, res: Response) => {
      // Missing static files must 404, not return index.html (stale hashed bundles after a deploy).
      if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.startsWith('/icons/')) {
        res.status(404).json({ error: 'Маршрут не найден.', code: 'NOT_FOUND' });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST);
}

process.on('unhandledRejection', (reason) => {
  console.error('[process] unhandledRejection', reason instanceof Error ? reason.message : 'unknown');
});

process.on('uncaughtException', (error) => {
  console.error('[process] uncaughtException', error.message);
  process.exit(1);
});

startServer().catch((error: unknown) => {
  console.error('[boot] failed', error instanceof Error ? error.message : 'unknown');
  process.exit(1);
});
