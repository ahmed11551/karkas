/**
 * Telegram notification about a newly saved lead.
 *
 * - Configured only via server env: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 *   Nothing is sent to the browser. Without both values the feature is off.
 * - Fire-and-forget: the caller does not await it, so a slow or failing
 *   Telegram API never delays the lead response.
 * - Plain text only (no parse_mode), so lead data cannot inject markup.
 * - Errors are logged without the bot token or the message body.
 */

const TELEGRAM_API = 'https://api.telegram.org';
const REQUEST_TIMEOUT_MS = 5000;
const MAX_TEXT_LENGTH = 4000; // Telegram limit is 4096 characters

export interface TelegramLeadInfo {
  id: string;
  timestamp: string;
  source: string;
  clientName?: string;
  phone: string;
  houseTitle?: string;
  calculatedPrice?: number;
  utm?: { [key: string]: string | undefined };
}

const SOURCE_LABELS: Record<string, string> = {
  hero_quick: 'Быстрая заявка',
  quiz_modal: 'Квиз',
  calculator: 'Калькулятор',
  catalog_spec: 'Каталог',
};

function readConfig(): { token: string; chatId: string } | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  // Bot tokens look like "123456:AA..."; chat ids are numbers (groups are negative) or @channel names.
  if (!/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  if (!/^(-?\d{1,20}|@[A-Za-z][A-Za-z0-9_]{4,})$/.test(chatId)) return null;
  return { token, chatId };
}

export function telegramEnabled(): boolean {
  return readConfig() !== null;
}

export function formatLeadMessage(lead: TelegramLeadInfo): string {
  const price =
    typeof lead.calculatedPrice === 'number' && lead.calculatedPrice > 0
      ? `${Math.round(lead.calculatedPrice).toLocaleString('ru-RU')} ₽`
      : '—';
  const utmSource = lead.utm?.utm_source ? `UTM: ${lead.utm.utm_source}` : null;

  const lines = [
    `Новая заявка ${lead.id}`,
    `Источник: ${SOURCE_LABELS[lead.source] || lead.source}`,
    `Имя: ${lead.clientName || 'не указано'}`,
    `Телефон: ${lead.phone}`,
    `Проект: ${lead.houseTitle || 'не указан'}`,
    `Сумма: ${price}`,
    utmSource,
    `Время: ${lead.timestamp}`,
  ].filter((line): line is string => Boolean(line));

  return lines.join('\n').slice(0, MAX_TEXT_LENGTH);
}

/**
 * Sends the lead to the configured Telegram chat. Never throws.
 */
export async function notifyTelegramNewLead(lead: TelegramLeadInfo): Promise<void> {
  const config = readConfig();
  if (!config) return;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: formatLeadMessage(lead),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Do not log the response body: it may echo request details.
      console.warn(`[telegram] sendMessage failed with HTTP ${res.status} for lead ${lead.id}`);
    }
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network error';
    console.warn(`[telegram] sendMessage ${reason} for lead ${lead.id}`);
  }
}
