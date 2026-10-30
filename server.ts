import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
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

// Default Admin Credentials (configurable via env)
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'karkas2026';

// Deterministic signed token so dev server restarts keep active admin sessions valid
const DETERMINISTIC_DEV_TOKEN =
  'krk_adm_' +
  crypto
    .createHmac('sha256', 'karkasnik_crm_secret_2026')
    .update(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`)
    .digest('hex');

const validAdminTokens = new Set<string>([DETERMINISTIC_DEV_TOKEN]);

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
    // ignore fs errors on read-only environments
  }
}

let leadsStore: ServerLead[] = ensureLeadsFile();

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
}

/**
 * Strict Admin Security Middleware:
 * Returns 403 Forbidden if valid admin_token is missing or invalid.
 */
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token || !validAdminTokens.has(token)) {
    res.status(403).json({
      error: '403 Forbidden: Access denied. Valid admin_token is required.',
      code: 'FORBIDDEN_ADMIN_TOKEN_REQUIRED',
    });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Admin Login Endpoint (/api/auth/login)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      validAdminTokens.add(DETERMINISTIC_DEV_TOKEN);
      res.status(200).json({
        success: true,
        admin_token: DETERMINISTIC_DEV_TOKEN,
        user: { username: ADMIN_LOGIN, role: 'Руководитель отдела продаж' },
      });
      return;
    }
    res.status(401).json({
      error: 'Неверный логин или пароль администратора.',
    });
  });

  // 2. Verify Admin Token (/api/auth/verify)
  app.get('/api/auth/verify', (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token || !validAdminTokens.has(token)) {
      res.status(403).json({
        authenticated: false,
        error: '403 Forbidden: Invalid or missing admin_token',
      });
      return;
    }
    res.status(200).json({
      authenticated: true,
      user: { username: ADMIN_LOGIN, role: 'Руководитель отдела продаж' },
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

  // 5. Public POST /api/leads (Validates phone strictly, creates new lead & broadcasts to Admins)
  app.post('/api/leads', (req: Request, res: Response) => {
    const body = req.body || {};
    const rawPhone = String(body.phone || '').trim();
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10 && (digits.startsWith('9') || digits.startsWith('4'))) {
      digits = '7' + digits;
    } else if (digits.length === 11 && digits.startsWith('8')) {
      digits = '7' + digits.substring(1);
    }

    const tenDigits = digits.substring(1);
    const isFakeOrInvalid =
      digits.length !== 11 ||
      !digits.startsWith('7') ||
      !/^(9\d{2}|495|499|496|498|812|800|[348]\d{2})/.test(tenDigits) ||
      /(\d)\1{5,}/.test(tenDigits) ||
      new Set(tenDigits.split('')).size < 3 ||
      ['1234567', '0123456', '7654321', '0000000', '1111111', '9999999'].includes(
        tenDigits.substring(3)
      );

    if (isFakeOrInvalid) {
      res.status(400).json({
        error: 'Некорректный номер телефона. Укажите действующий контактный номер.',
        code: 'INVALID_PHONE_NUMBER',
      });
      return;
    }

    const nowFormatted =
      body.timestamp ||
      new Date().toLocaleString('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
      });

    const calcParams: LeadCalculatorParams = body.calculatorParams || {
      size: 36,
      insulation: '150 мм (Осень-Зима)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: 'Без веранды',
      distanceKm: 45,
    };

    const historyEntry: CalculationHistoryItem = {
      timestamp: nowFormatted,
      action:
        body.source === 'calculator'
          ? 'Фиксация цены в калькуляторе'
          : body.source === 'quiz_modal'
            ? 'Завершение квиза с подбором комплектации'
            : 'Быстрая заявка с фиксацией акции',
      houseTitle: body.houseTitle || 'Индивидуальный проект',
      calculatedPrice: body.calculatedPrice || 707000,
      size: calcParams.size,
      insulation: calcParams.insulation,
      foundation: calcParams.foundation,
      veranda: calcParams.veranda,
      distanceKm: calcParams.distanceKm,
    };

    const newLead: ServerLead = {
      id: body.id || 'LD-' + Date.now().toString(36).toUpperCase().slice(-5),
      timestamp: nowFormatted,
      createdAtMs: Date.now(),
      source: body.source || 'calculator',
      clientName: body.clientName || 'Клиент сайта',
      phone: rawPhone,
      houseTitle: body.houseTitle || 'Индивидуальный проект',
      calculatedPrice: body.calculatedPrice || 707000,
      status: 'new',
      calculatorParams: calcParams,
      calculationHistory: body.calculationHistory || [historyEntry],
      giftsSelected: body.giftsSelected || ['Металлочерепица 0 ₽', 'Сваи −50%'],
      quizAnswers: body.quizAnswers,
      utm: body.utm,
      managerNotes: body.managerNotes || '',
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

    res.status(201).json({ lead: newLead });
  });

  // 6. Protected PATCH /api/leads/:id (Status Dropdown & Notes Update — 403 without token)
  app.patch('/api/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, managerNotes, clientName } = req.body || {};

    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Лид не найден' });
      return;
    }

    const updated: ServerLead = {
      ...leadsStore[idx],
      ...(status ? { status: normalizeStatus(status) } : {}),
      ...(typeof managerNotes === 'string' ? { managerNotes } : {}),
      ...(typeof clientName === 'string' ? { clientName } : {}),
    };

    leadsStore[idx] = updated;
    saveLeadsToDisk(leadsStore);

    res.status(200).json({ lead: updated });
  });

  // 7. Protected DELETE /api/leads/:id (Delete single lead — 403 without token)
  app.delete('/api/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    leadsStore = leadsStore.filter((l) => l.id !== id);
    saveLeadsToDisk(leadsStore);
    res.status(200).json({ success: true, total: leadsStore.length });
  });

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
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0');
}

startServer();
