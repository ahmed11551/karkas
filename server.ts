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

export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'contract' | 'completed';

export interface LeadCalculatorParams {
  size: number; // e.g. 36 m²
  insulation: string; // e.g. '150 мм (Осень-Зима)'
  foundation: string; // e.g. 'Свайно-винтовой (−50%)'
  veranda: string; // e.g. 'С верандой' | 'Без веранды'
  distanceKm?: number; // e.g. 45 км от МКАД
  mortgageMode?: boolean;
  monthlyPayment?: number;
}

export interface CalculationHistoryItem {
  timestamp: string;
  action: string;
  houseTitle: string;
  calculatedPrice: number;
  size: number;
  insulation: string;
  foundation: string;
  veranda: string;
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
  calculatorParams?: LeadCalculatorParams;
  calculationHistory?: CalculationHistoryItem[];
  giftsSelected?: string[];
  quizAnswers?: { [key: string]: string };
  utm?: { [key: string]: string };
  managerNotes?: string;
}

// Connected SSE clients for real-time lead notifications
const sseClients = new Set<Response>();

// Initial seed leads with full 5-stage statuses and calculation history
const INITIAL_LEADS: ServerLead[] = [
  {
    id: 'LD-94A8K',
    timestamp: '30.10.2026, 14:18',
    createdAtMs: Date.now() - 1000 * 60 * 18,
    source: 'calculator',
    clientName: 'Алексей Смирнов',
    phone: '+7 (916) 482-19-40',
    houseTitle: 'Дачный дом 6×6 (Хит продаж)',
    calculatedPrice: 707000,
    status: 'new',
    calculatorParams: {
      size: 36,
      insulation: '150 мм (Осень-Зима)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'Без веранды',
      distanceKm: 45,
      mortgageMode: false,
    },
    calculationHistory: [
      {
        timestamp: '30.10.2026, 14:14',
        action: 'Предварительный расчёт в конфигураторе',
        houseTitle: 'Дачный дом 6×6 (базовый)',
        calculatedPrice: 672000,
        size: 36,
        insulation: '100 мм (Лето)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'Без веранды',
        distanceKm: 45,
      },
      {
        timestamp: '30.10.2026, 14:18',
        action: 'Фиксация сметы («Закрепить цену»)',
        houseTitle: 'Дачный дом 6×6 (Хит продаж)',
        calculatedPrice: 707000,
        size: 36,
        insulation: '150 мм (Осень-Зима)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'Без веранды',
        distanceKm: 45,
      },
    ],
    giftsSelected: ['Металлочерепица 0 ₽', 'Сваи −50%', 'Доставка до 100 км 0 ₽'],
    managerNotes: 'Клиент зафиксировал цену в калькуляторе. Участок в Истринском районе (45 км от МКАД).',
  },
  {
    id: 'LD-91M3P',
    timestamp: '30.10.2026, 12:05',
    createdAtMs: Date.now() - 1000 * 60 * 145,
    source: 'quiz_modal',
    clientName: 'Елена Волкова',
    phone: '+7 (926) 773-04-12',
    houseTitle: 'Дом с панорамной верандой 6×8',
    calculatedPrice: 836000,
    status: 'contacted',
    calculatorParams: {
      size: 48,
      insulation: '200 мм (Арктика ПМЖ)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'С террасой / верандой (+60 000 ₽)',
      distanceKm: 65,
      mortgageMode: true,
      monthlyPayment: 7415,
    },
    calculationHistory: [
      {
        timestamp: '30.10.2026, 11:58',
        action: 'Выбор в каталоге проектов',
        houseTitle: 'Дом с панорамной верандой 6×8',
        calculatedPrice: 776000,
        size: 48,
        insulation: '150 мм (Осень-Зима)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'Без веранды',
        distanceKm: 65,
      },
      {
        timestamp: '30.10.2026, 12:05',
        action: 'Заполнение квиза + ипотечный контур 200 мм',
        houseTitle: 'Дом с панорамной верандой 6×8',
        calculatedPrice: 836000,
        size: 48,
        insulation: '200 мм (Арктика ПМЖ)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'С террасой / верандой (+60 000 ₽)',
        distanceKm: 65,
      },
    ],
    giftsSelected: ['Металлочерепица 0 ₽', 'Сборка 0 ₽', 'Сваи −50%', 'Шпунтованный пол 36 мм'],
    quizAnswers: {
      '0': 'Для круглогодичного проживания (ПМЖ)',
      '1': '45–60 м² (оптимально для семьи)',
      '2': '200 мм (максимальное энергосбережение)',
      '3': 'В ближайший месяц',
      '4': 'Шпунтованный пол 36 мм камерной сушки',
    },
    managerNotes: 'Связались по телефону. Интересует льготная ипотека 6%. Отправлена PDF-смета в WhatsApp.',
  },
  {
    id: 'LD-89B4V',
    timestamp: '29.10.2026, 19:30',
    createdAtMs: Date.now() - 1000 * 60 * 60 * 16,
    source: 'calculator',
    clientName: 'Сергей Антонов',
    phone: '+7 (985) 334-12-90',
    houseTitle: 'А-Фрейм Шале 6×8',
    calculatedPrice: 801000,
    status: 'negotiation',
    calculatorParams: {
      size: 48,
      insulation: '150 мм (Осень-Зима)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'С террасой / верандой (+60 000 ₽)',
      distanceKm: 80,
      mortgageMode: false,
    },
    calculationHistory: [
      {
        timestamp: '29.10.2026, 19:30',
        action: 'Расчет с террасой и свайным полем',
        houseTitle: 'А-Фрейм Шале 6×8',
        calculatedPrice: 801000,
        size: 48,
        insulation: '150 мм (Осень-Зима)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'С террасой / верандой (+60 000 ₽)',
        distanceKm: 80,
      },
    ],
    giftsSelected: ['Металлочерепица 0 ₽', 'Сваи −50%', 'Окна ПВХ двухкамерные'],
    managerNotes: 'На этапе переговоров: согласовываем дату выезда инженера на участок под Серпуховом.',
  },
  {
    id: 'LD-87C2R',
    timestamp: '29.10.2026, 17:42',
    createdAtMs: Date.now() - 1000 * 60 * 60 * 21,
    source: 'catalog_spec',
    clientName: 'Дмитрий Ковалев',
    phone: '+7 (903) 519-88-23',
    houseTitle: 'Барнхаус Сканди 6×9',
    calculatedPrice: 928000,
    status: 'contract',
    calculatorParams: {
      size: 54,
      insulation: '200 мм (Арктика ПМЖ)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'С террасой / верандой (+60 000 ₽)',
      distanceKm: 30,
      mortgageMode: false,
    },
    calculationHistory: [
      {
        timestamp: '29.10.2026, 17:42',
        action: 'Заказ комплектации ПМЖ 200 мм из каталога',
        houseTitle: 'Барнхаус Сканди 6×9',
        calculatedPrice: 928000,
        size: 54,
        insulation: '200 мм (Арктика ПМЖ)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'С террасой / верандой (+60 000 ₽)',
        distanceKm: 30,
      },
    ],
    giftsSelected: ['Металлочерепица 0 ₽', 'Сваи −50%', 'Антисептирование Неомид'],
    managerNotes: 'Договор №КД-1042 подписан. Выезд бригады на закрутку свай назначен на субботу.',
  },
  {
    id: 'LD-79F5T',
    timestamp: '27.10.2026, 10:15',
    createdAtMs: Date.now() - 1000 * 60 * 60 * 72,
    source: 'hero_quick',
    clientName: 'Игорь Романов',
    phone: '+7 (915) 204-61-09',
    houseTitle: 'Дачный дом 6×6',
    calculatedPrice: 672000,
    status: 'completed',
    calculatorParams: {
      size: 36,
      insulation: '150 мм (Осень-Зима)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'Без веранды',
      distanceKm: 55,
      mortgageMode: false,
    },
    calculationHistory: [
      {
        timestamp: '27.10.2026, 10:15',
        action: 'Фиксация базовой сметы 6×6 (150 мм)',
        houseTitle: 'Дачный дом 6×6',
        calculatedPrice: 672000,
        size: 36,
        insulation: '150 мм (Осень-Зима)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'Без веранды',
        distanceKm: 55,
      },
    ],
    giftsSelected: ['Металлочерепица 0 ₽', 'Сваи −50%', 'Электроконвектор в подарок'],
    managerNotes: 'Дом сдан за 2 дня в Дмитровском районе. Акт подписан, оплата 100% получена.',
  },
];

function normalizeStatus(st?: string): LeadStatus {
  if (st === 'in_progress') return 'contacted';
  if (st === 'done') return 'completed';
  if (st === 'new' || st === 'contacted' || st === 'negotiation' || st === 'contract' || st === 'completed') {
    return st;
  }
  return 'new';
}

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
            ? 'Завершение квиза с подбором комплектации'
            : 'Быстрая заявка с фиксацией акции',
      houseTitle: lead.houseTitle,
      calculatedPrice: lead.calculatedPrice,
      size: calcParams.size,
      insulation: calcParams.insulation,
      foundation: calcParams.foundation,
      veranda: calcParams.veranda,
      distanceKm: calcParams.distanceKm,
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

  // 6. Protected PATCH /api/leads/:id (Status Dropdown & Notes Update — 403 without token)
  app.patch('/api/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^LD-[A-F0-9]{8}$/.test(id) && !/^LD-[A-Z0-9]{5}$/.test(id)) {
      res.status(400).json({ error: 'Некорректный идентификатор заявки.', code: 'INVALID_ID' });
      return;
    }
    const { status, managerNotes, clientName } = req.body || {};

    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Лид не найден', code: 'NOT_FOUND' });
      return;
    }

    const allowedStatus =
      status === 'new' ||
      status === 'contacted' ||
      status === 'negotiation' ||
      status === 'contract' ||
      status === 'completed';
    const notes = sanitizeManagerNotes(managerNotes);
    let nextName: string | undefined;
    if (typeof clientName === 'string') {
      const nameCheck = validateClientName(clientName, 'ru');
      if (!nameCheck.ok) {
        res.status(400).json({ error: nameCheck.error, code: 'INVALID_NAME' });
        return;
      }
      nextName = nameCheck.value || leadsStore[idx].clientName;
    }

    const updated: ServerLead = {
      ...leadsStore[idx],
      ...(allowedStatus ? { status } : {}),
      ...(notes !== null ? { managerNotes: notes } : {}),
      ...(nextName !== undefined ? { clientName: nextName } : {}),
    };

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
