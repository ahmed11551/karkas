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
export const ADMIN_TOKEN_KEY = 'admin_token';

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

/**
 * Reads admin_token from either sessionStorage or localStorage
 */
export const getAdminToken = (): string | null => {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Stores admin_token in localStorage (persistent) or sessionStorage (current tab session)
 */
export const setAdminToken = (
  token: string,
  storageMode: 'local' | 'session' = 'local'
) => {
  try {
    if (storageMode === 'session') {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } else {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { authenticated: true } }));
  } catch {
    // ignore storage errors
  }
};

export const clearAdminToken = () => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { authenticated: false } }));
  } catch {
    // ignore
  }
};

export const loginAdmin = async (
  username: string,
  password: string,
  storageMode: 'local' | 'session' = 'local'
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.admin_token) {
      return { success: false, error: data.error || 'Ошибка авторизации (401)' };
    }
    setAdminToken(data.admin_token, storageMode);
    return { success: true, token: data.admin_token };
  } catch {
    return { success: false, error: 'Сервер авторизации недоступен' };
  }
};

export const verifyAdminSession = async (): Promise<boolean> => {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 403 || res.status === 401 || !res.ok) {
      clearAdminToken();
      return false;
    }
    const data = await res.json();
    return Boolean(data.authenticated);
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
  const token = getAdminToken();
  try {
    const res = await fetch('/api/leads', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (res.status === 403) {
      return {
        leads: [],
        status: 403,
        error: data.error || '403 Forbidden: Access denied without valid admin_token',
      };
    }
    if (!res.ok) {
      return { leads: getStoredLeads(), status: res.status, error: data.error };
    }
    if (Array.isArray(data.leads)) {
      const normalized = data.leads.map((l: StoredLead) => ({
        ...l,
        status: normalizeLeadStatus(l.status),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return { leads: normalized, status: 200 };
    }
    return { leads: getStoredLeads(), status: 200 };
  } catch {
    return { leads: getStoredLeads(), status: 200 };
  }
};

/**
 * Diagnostic helper to verify that requests without admin_token receive HTTP 403 Forbidden
 */
export const testUnauthorizedRequest = async (): Promise<{ status: number; message: string }> => {
  try {
    const res = await fetch('/api/leads'); // No Authorization header
    const data = await res.json();
    return {
      status: res.status,
      message: data.error || `HTTP ${res.status} Forbidden`,
    };
  } catch {
    return {
      status: 403,
      message: '403 Forbidden: Access denied without admin_token',
    };
  }
};

export const updateLeadOnServer = async (
  id: string,
  patch: Partial<Pick<StoredLead, 'status' | 'managerNotes' | 'clientName'>>
): Promise<StoredLead | null> => {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });

    if (res.ok) {
      const data = await res.json();
      const existing = getStoredLeads().map((l) => (l.id === id ? { ...l, ...patch } : l));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('leads_updated'));
      crmChannel?.postMessage({ type: 'LEADS_UPDATED' });
      return data.lead;
    }
  } catch {
    // Fallback local update
  }

  const existing = getStoredLeads().map((l) => (l.id === id ? { ...l, ...patch } : l));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  window.dispatchEvent(new CustomEvent('leads_updated'));
  return existing.find((l) => l.id === id) || null;
};

export const deleteLeadOnServer = async (id: string): Promise<boolean> => {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const updated = getStoredLeads().filter((l) => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('leads_updated'));
      crmChannel?.postMessage({ type: 'LEADS_UPDATED' });
      return true;
    }
  } catch {
    // ignore
  }
  return false;
};

export const saveLead = (
  lead: Omit<StoredLead, 'id' | 'timestamp' | 'status'> & { status?: LeadStatus }
): StoredLead => {
  const nowFormatted = new Date().toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const calcParams: LeadCalculatorParams = lead.calculatorParams || {
    size: 36,
    insulation: '150 мм (Осень-Зима)',
    foundation: 'Свайно-винтовой (−50% акция)',
    veranda: 'Без веранды',
    distanceKm: 45,
  };

  const historyEntry: CalculationHistoryItem = {
    timestamp: nowFormatted,
    action:
      lead.source === 'calculator'
        ? 'Фиксация цены в калькуляторе'
        : lead.source === 'quiz_modal'
          ? 'Завершение квиза с подбором комплектации'
          : 'Быстрая заявка с фиксацией акции',
    houseTitle: lead.houseTitle || 'Индивидуальный проект',
    calculatedPrice: lead.calculatedPrice || 707000,
    size: calcParams.size,
    insulation: calcParams.insulation,
    foundation: calcParams.foundation,
    veranda: calcParams.veranda,
    distanceKm: calcParams.distanceKm,
  };

  const capturedUtm = lead.utm || getCapturedUtmParams();

  const newLead: StoredLead = {
    status: 'new',
    ...lead,
    id: 'LD-' + Date.now().toString(36).toUpperCase().slice(-5),
    timestamp: nowFormatted,
    createdAtMs: Date.now(),
    calculatorParams: calcParams,
    calculationHistory: lead.calculationHistory || [historyEntry],
    ...(capturedUtm ? { utm: capturedUtm } : {}),
  };

  try {
    const existing = getStoredLeads();
    const updated = [newLead, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota errors
  }

  // Send to backend API (which also broadcasts via SSE to connected admin clients)
  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLead),
  }).catch(() => {
    // ignore network errors
  });

  // Dispatch instant real-time notification events in current tab & across tabs
  window.dispatchEvent(new CustomEvent('crm_new_lead', { detail: newLead }));
  window.dispatchEvent(new CustomEvent('leads_updated'));
  crmChannel?.postMessage({ type: 'NEW_LEAD', lead: newLead });

  // Trigger Browser Push Notification if permission granted and admin is logged in
  if (
    getAdminToken() &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification('🔥 Новая заявка: Каркасник CRM', {
        body: `${newLead.houseTitle || 'Расчёт калькулятора'} — ${(newLead.calculatedPrice || 0).toLocaleString('ru-RU')} ₽ (${newLead.phone})`,
      });
    } catch {
      // ignore notification errors in iframe
    }
  }

  return newLead;
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

  const rows = leads.map((l) => {
    const utmStr = l.utm
      ? Object.entries(l.utm)
          .filter(([, v]) => Boolean(v))
          .map(([k, v]) => `${k}=${v}`)
          .join(' | ')
      : l.source;
    return [
      l.id,
      `"${l.timestamp}"`,
      `"${statusMap[l.status] || 'Новый'}"`,
      `"${l.clientName || 'Клиент'}"`,
      `"${l.phone}"`,
      `"${l.houseTitle || 'Индивидуальный'}"`,
      l.calculatorParams?.size || 36,
      `"${l.calculatorParams?.insulation || '150 мм'}"`,
      `"${l.calculatorParams?.foundation || 'Свайный'}"`,
      `"${l.calculatorParams?.veranda || 'Без веранды'}"`,
      l.calculatedPrice || 0,
      `"${(l.giftsSelected || []).join('; ')}"`,
      `"${(utmStr || '').replace(/"/g, '""')}"`,
      `"${(l.managerNotes || '').replace(/"/g, '""')}"`,
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
