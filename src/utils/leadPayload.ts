import { validateRussianPhone } from './phoneValidation';
import type { Language } from '../types';

export const LEAD_SOURCES = ['hero_quick', 'quiz_modal', 'calculator', 'catalog_spec'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/**
 * Every field is optional: the server stores only what the client actually sent.
 * Missing values are never filled with defaults (no invented size, price or distance).
 */
export interface SanitizedCalculatorParams {
  size?: number;
  insulation?: string;
  foundation?: string;
  veranda?: string;
  distanceKm?: number;
  mortgageMode?: boolean;
  monthlyPayment?: number;
}

export interface SanitizedPublicLead {
  source: LeadSource;
  clientName: string;
  phone: string;
  houseTitle?: string;
  calculatedPrice?: number;
  calculatorParams?: SanitizedCalculatorParams;
  giftsSelected: string[];
  quizAnswers?: Record<string, string>;
  utm?: Record<string, string>;
  pathname?: string;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer'] as const;
const NAME_PATTERN = /^[\p{L}\p{M}\s'.-]+$/u;

export function sanitizePlainText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Returns a clamped number, or undefined when the value is absent or not numeric. */
function optionalNumber(value: unknown, min: number, max: number): number | undefined {
  const numeric =
    typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(numeric)) return undefined;
  return Math.min(max, Math.max(min, numeric));
}

function optionalText(value: unknown, max: number): string | undefined {
  return sanitizePlainText(value, max) || undefined;
}

/** Keeps only fields the client really sent. Returns undefined when nothing was sent. */
function sanitizeCalculatorParams(paramsRaw: Record<string, unknown>): SanitizedCalculatorParams | undefined {
  const out: SanitizedCalculatorParams = {
    size: optionalNumber(paramsRaw.size, 12, 400),
    insulation: optionalText(paramsRaw.insulation, 80),
    foundation: optionalText(paramsRaw.foundation, 80),
    veranda: optionalText(paramsRaw.veranda, 80),
    distanceKm: optionalNumber(paramsRaw.distanceKm, 0, 3000),
    mortgageMode: typeof paramsRaw.mortgageMode === 'boolean' ? paramsRaw.mortgageMode : undefined,
  };
  if (out.mortgageMode) {
    out.monthlyPayment = optionalNumber(paramsRaw.monthlyPayment, 0, 5_000_000);
  }
  const cleaned = Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as SanitizedCalculatorParams;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function validateClientName(
  name: string,
  lang: Language = 'ru'
): { ok: true; value: string } | { ok: false; error: string } {
  const value = sanitizePlainText(name, 80);
  if (!value) return { ok: true, value: '' };
  if (value.length < 2 || !NAME_PATTERN.test(value)) {
    return {
      ok: false,
      error:
        lang === 'ru'
          ? 'Имя может содержать только буквы, пробел, дефис и апостроф.'
          : 'Name can contain only letters, spaces, hyphens, and apostrophes.',
    };
  }
  return { ok: true, value };
}

function sanitizePathname(value: unknown): string | undefined {
  const text = sanitizePlainText(value, 180);
  if (!text.startsWith('/') || text.includes('//')) return undefined;
  return text;
}

export function parsePublicLead(
  body: unknown
): { ok: true; lead: SanitizedPublicLead } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса.', code: 'BAD_BODY' };
  }

  const raw = body as Record<string, unknown>;
  if (raw.consent !== true) {
    return {
      ok: false,
      error: 'Нужно согласие на обработку персональных данных.',
      code: 'CONSENT_REQUIRED',
    };
  }

  const phoneCheck = validateRussianPhone(typeof raw.phone === 'string' ? raw.phone : '', 'ru');
  if (!phoneCheck.isValid || !phoneCheck.normalized) {
    return {
      ok: false,
      error: phoneCheck.error || 'Некорректный номер телефона.',
      code: 'INVALID_PHONE_NUMBER',
    };
  }

  if (!LEAD_SOURCES.includes(raw.source as LeadSource)) {
    return { ok: false, error: 'Неизвестный источник заявки.', code: 'INVALID_SOURCE' };
  }

  const nameCheck = validateClientName(typeof raw.clientName === 'string' ? raw.clientName : '', 'ru');
  if (!nameCheck.ok) {
    return { ok: false, error: nameCheck.error, code: 'INVALID_NAME' };
  }

  const paramsRaw =
    raw.calculatorParams && typeof raw.calculatorParams === 'object' && !Array.isArray(raw.calculatorParams)
      ? (raw.calculatorParams as Record<string, unknown>)
      : {};

  const calculatorParams = sanitizeCalculatorParams(paramsRaw);

  const gifts = Array.isArray(raw.giftsSelected)
    ? raw.giftsSelected
        .map((gift) => sanitizePlainText(gift, 80))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  let quizAnswers: Record<string, string> | undefined;
  if (raw.quizAnswers && typeof raw.quizAnswers === 'object' && !Array.isArray(raw.quizAnswers)) {
    quizAnswers = {};
    for (const [key, value] of Object.entries(raw.quizAnswers as Record<string, unknown>).slice(0, 12)) {
      if (!/^\d{1,2}$/.test(key)) continue;
      const text = sanitizePlainText(value, 200);
      if (text) quizAnswers[key] = text;
    }
    if (Object.keys(quizAnswers).length === 0) quizAnswers = undefined;
  }

  let utm: Record<string, string> | undefined;
  if (raw.utm && typeof raw.utm === 'object' && !Array.isArray(raw.utm)) {
    const source = raw.utm as Record<string, unknown>;
    utm = {};
    for (const key of UTM_KEYS) {
      const text = sanitizePlainText(source[key], 120);
      if (text) utm[key] = text;
    }
    if (Object.keys(utm).length === 0) utm = undefined;
  }

  return {
    ok: true,
    lead: {
      source: raw.source as LeadSource,
      clientName: nameCheck.value || 'Клиент сайта',
      phone: phoneCheck.normalized,
      houseTitle: optionalText(raw.houseTitle, 140),
      calculatedPrice: optionalNumber(raw.calculatedPrice, 100_000, 30_000_000),
      calculatorParams,
      giftsSelected: gifts,
      quizAnswers,
      utm,
      pathname: sanitizePathname(raw.pathname),
    },
  };
}

export function sanitizeManagerNotes(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return sanitizePlainText(value, 2000);
}
