import { parsePublicLead } from './leadPayload';
import { reachGoal } from './analytics';

export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'contract' | 'completed';

export interface LeadCalculatorParams {
  size: number; // e.g. 36 m²
  insulation: string; // e.g. '150 мм (Осень-Зима)'
  foundation: string; // e.g. 'Свайно-винтовой (−50%)'
  veranda: string; // e.g. 'С верандой' | 'Без веранды'
  distanceKm?: number; // e.g. 45
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

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
}

export interface StoredLead {
  id: string;
  timestamp: string;
  createdAtMs?: number;
  source: 'hero_quick' | 'quiz_modal' | 'calculator' | 'catalog_spec';
  clientName?: string;
  phone: string;
  houseTitle?: string;
  calculatedPrice?: number;
  status: LeadStatus;
  calculatorParams?: LeadCalculatorParams;
  calculationHistory?: CalculationHistoryItem[];
  giftsSelected?: string[];
  quizAnswers?: { [key: number]: string };
  utm?: UtmParams;
  managerNotes?: string;
}

const STORAGE_KEY = 'karkasnik_leads_archive_v3';
const UTM_STORAGE_KEY = 'karkasnik_utm_params';
const LEGACY_TOKEN_KEY = 'admin_token';
const UI_FLAG = 'karkas_admin_ui';

function safeApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object' || !('error' in data)) return fallback;
  const message = (data as { error?: unknown }).error;
  if (typeof message !== 'string') return fallback;
  if (message.length > 240 || message.includes('    at ') || message.includes('/Users/')) return fallback;
  return message;
}

function clearLegacyToken() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore storage access issues
  }
}

/**
 * Captures UTM tags from URL query parameters and persists them in sessionStorage for attribution
 */
export function getCapturedUtmParams(): UtmParams | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys: (keyof UtmParams)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ];
    const currentUtm: UtmParams = {};
    let hasUtm = false;

    for (const key of utmKeys) {
      const val = params.get(key);
      if (val && val.trim()) {
        currentUtm[key] = val.trim();
        hasUtm = true;
      }
    }

    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      currentUtm.referrer = document.referrer;
      hasUtm = true;
    }

    if (hasUtm) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentUtm));
      return currentUtm;
    }

    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UtmParams;
    }
  } catch {
    // ignore storage access issues
  }
  return undefined;
}

const crmChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('karkasnik_crm_channel')
    : null;

if (crmChannel) {
  crmChannel.onmessage = (event) => {
    if (event.data?.type === 'NEW_LEAD' && event.data.lead) {
      window.dispatchEvent(new CustomEvent('crm_new_lead', { detail: event.data.lead }));
      window.dispatchEvent(new CustomEvent('leads_updated'));
    } else if (event.data?.type === 'LEADS_UPDATED') {
      window.dispatchEvent(new CustomEvent('leads_updated'));
    }
  };
}

export function normalizeLeadStatus(st?: string): LeadStatus {
  if (st === 'in_progress') return 'contacted';
  if (st === 'done') return 'completed';
  if (
    st === 'new' ||
    st === 'contacted' ||
    st === 'negotiation' ||
    st === 'contract' ||
    st === 'completed'
  ) {
    return st;
  }
  return 'new';
}

/** Non-secret UI hint. The session itself lives in an HttpOnly cookie. */
export const markAdminUiSession = () => {
  try {
    sessionStorage.setItem(UI_FLAG, '1');
    clearLegacyToken();
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { authenticated: true } }));
  } catch {
    // ignore storage errors
  }
};

export const clearAdminUiSession = () => {
  try {
    sessionStorage.removeItem(UI_FLAG);
    clearLegacyToken();
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { authenticated: false } }));
  } catch {
    // ignore
  }
};

export const hasAdminUiSession = (): boolean => {
  try {
    return sessionStorage.getItem(UI_FLAG) === '1';
  } catch {
    return false;
  }
};

export const loginAdmin = async (
  username: string,
  password: string,
  remember = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password, remember }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: safeApiError(data, 'Неверный логин или пароль') };
    }
    markAdminUiSession();
    return { success: true };
  } catch {
    return { success: false, error: 'Сервер авторизации недоступен' };
  }
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // The local UI hint is cleared even if the network call fails.
  }
  clearAdminUiSession();
};

export const verifyAdminSession = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/auth/verify', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (res.status === 401 || res.status === 403) {
      clearAdminUiSession();
      return false;
    }
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    if (!data.authenticated) {
      clearAdminUiSession();
      return false;
    }
    markAdminUiSession();
    return true;
  } catch {
    return false;
  }
};

/**
 * Fetches leads from backend API with strict admin_token verification.
 * Server returns 403 Forbidden if token is missing or invalid.
 */
export const fetchProtectedLeads = async (): Promise<{
  leads: StoredLead[];
  status: number;
  error?: string;
}> => {
  try {
    const res = await fetch('/api/leads', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 403 || res.status === 401) {
      clearAdminUiSession();
      return {
        leads: [],
        status: res.status,
        error: safeApiError(data, 'Доступ запрещён'),
      };
    }
    if (!res.ok) {
      return { leads: [], status: res.status, error: safeApiError(data, 'Не удалось загрузить заявки') };
    }
    if (Array.isArray(data.leads)) {
      const normalized = data.leads.map((l: StoredLead) => ({
        ...l,
        status: normalizeLeadStatus(l.status),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return { leads: normalized, status: 200 };
    }
    return { leads: [], status: 200 };
  } catch {
    return { leads: [], status: 0, error: 'Сервер недоступен' };
  }
};

/**
 * Confirms that a request without the admin cookie receives HTTP 403.
 * credentials: 'omit' keeps an existing session from being sent.
 */
export const testUnauthorizedRequest = async (): Promise<{ status: number; message: string }> => {
  try {
    const res = await fetch('/api/leads', { credentials: 'omit' });
    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      message: safeApiError(data, `HTTP ${res.status}`),
    };
  } catch {
    return {
      status: 0,
      message: 'Сервер недоступен',
    };
  }
};

export const updateLeadOnServer = async (
  id: string,
  patch: Partial<Pick<StoredLead, 'status' | 'managerNotes' | 'clientName'>>
): Promise<StoredLead | null> => {
  try {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const existing = getStoredLeads().map((l) => (l.id === id ? { ...l, ...patch } : l));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('leads_updated'));
    crmChannel?.postMessage({ type: 'LEADS_UPDATED' });
    return data.lead;
  } catch {
    return null;
  }
};

export const deleteLeadOnServer = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!res.ok) return false;
    const updated = getStoredLeads().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated'));
    crmChannel?.postMessage({ type: 'LEADS_UPDATED' });
    return true;
  } catch {
    return false;
  }
};

export const saveLead = async (
  lead: Omit<StoredLead, 'id' | 'timestamp' | 'status'> & { status?: LeadStatus; consent: boolean }
): Promise<{ ok: boolean; error?: string; lead?: StoredLead }> => {
  const parsed = parsePublicLead({
    ...lead,
    utm: lead.utm || getCapturedUtmParams(),
    consent: lead.consent,
  });
  if (!parsed.ok) return { ok: false, error: parsed.error };

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...parsed.lead, consent: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.lead) {
      return { ok: false, error: safeApiError(data, 'Не удалось отправить заявку.') };
    }

    const newLead = data.lead as StoredLead;
    try {
      const updated = [newLead, ...getStoredLeads().filter((item) => item.id !== newLead.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }

    window.dispatchEvent(new CustomEvent('crm_new_lead', { detail: newLead }));
    window.dispatchEvent(new CustomEvent('leads_updated'));
    crmChannel?.postMessage({ type: 'NEW_LEAD', lead: newLead });

    if (
      hasAdminUiSession() &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('Новая заявка: Каркасник CRM', {
          body: `${newLead.houseTitle || 'Расчёт'} — ${(newLead.calculatedPrice || 0).toLocaleString('ru-RU')} ₽`,
        });
      } catch {
        // ignore notification errors in iframe
      }
    }

    reachGoal('lead_sent');
    return { ok: true, lead: newLead };
  } catch {
    return { ok: false, error: 'Сервер недоступен. Повторите отправку через минуту.' };
  }
};

export const getStoredLeads = (): StoredLead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialArchive: StoredLead[] = [
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
          managerNotes: 'Интересует льготная ипотека 6%. Отправлена PDF-смета в WhatsApp.',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialArchive));
      return initialArchive;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((l: StoredLead) => ({ ...l, status: normalizeLeadStatus(l.status) }))
      : [];
  } catch {
    return [];
  }
};

export const exportLeadsCsv = (leads: StoredLead[]) => {
  const headers = [
    'ID',
    'Дата',
    'Статус',
    'Имя клиента',
    'Телефон',
    'Проект',
    'Площадь (м2)',
    'Утепление',
    'Фундамент',
    'Веранда',
    'Сумма (₽)',
    'Бонусы',
    'UTM / Источник',
    'Заметки менеджера',
  ];
  const statusMap: Record<LeadStatus, string> = {
    new: 'Новый (New)',
    contacted: 'Связались (Contacted)',
    negotiation: 'Переговоры (Negotiation)',
    contract: 'Договор (Contract)',
    completed: 'Сдан (Completed)',
  };

  const csvCell = (value: unknown) => {
    const text = String(value ?? '');
    const neutralized = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${neutralized.replace(/"/g, '""')}"`;
  };

  const rows = leads.map((l) => {
    const utmStr = l.utm
      ? Object.entries(l.utm)
          .filter(([, v]) => Boolean(v))
          .map(([k, v]) => `${k}=${v}`)
          .join(' | ')
      : l.source;
    return [
      csvCell(l.id),
      csvCell(l.timestamp),
      csvCell(statusMap[l.status] || 'Новый'),
      csvCell(l.clientName || 'Клиент'),
      csvCell(l.phone),
      csvCell(l.houseTitle || 'Индивидуальный'),
      csvCell(l.calculatorParams?.size || 36),
      csvCell(l.calculatorParams?.insulation || '150 мм'),
      csvCell(l.calculatorParams?.foundation || 'Свайный'),
      csvCell(l.calculatorParams?.veranda || 'Без веранды'),
      csvCell(l.calculatedPrice || 0),
      csvCell((l.giftsSelected || []).join('; ')),
      csvCell(utmStr || ''),
      csvCell(l.managerNotes || ''),
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `crm_leads_karkasnik_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
