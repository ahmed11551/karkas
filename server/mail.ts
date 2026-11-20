/**
 * Email notification for a newly saved lead.
 *
 * Sends through the mailbox itself (Yandex SMTP, port 465). Configured only
 * via server env: MAIL_USER and MAIL_PASSWORD. MAIL_TO defaults to MAIL_USER.
 * Without a password the feature is off — the address can still be shown on
 * the site. Fire-and-forget: a slow SMTP server never delays the lead response.
 * Errors are logged without the password or the message body.
 */

import tls from 'node:tls';
import { formatLeadMessage, type TelegramLeadInfo } from './telegram.ts';

const TIMEOUT_MS = 8000;

interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  to: string;
}

function readConfig(): MailConfig | null {
  const user = (process.env.MAIL_USER || '').trim();
  const password = process.env.MAIL_PASSWORD || '';
  const to = (process.env.MAIL_TO || user).trim();
  const host = (process.env.MAIL_HOST || 'smtp.yandex.ru').trim();
  const port = Number(process.env.MAIL_PORT || 465);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return null;
  if (!password.trim() || !host || !Number.isFinite(port)) return null;
  return { host, port, user, password, to };
}

export function mailEnabled(): boolean {
  return readConfig() !== null;
}

function expectCode(response: string, code: string): void {
  const lines = response.split(/\r?\n/).filter(Boolean);
  const last = lines[lines.length - 1] || '';
  if (!last.startsWith(`${code} `) && !last.startsWith(`${code}-`)) {
    throw new Error(`smtp ${code} expected`);
  }
}

async function sendSmtp(config: MailConfig, subject: string, text: string): Promise<void> {
  const socket = tls.connect({
    host: config.host,
    port: config.port,
    servername: config.host,
    timeout: TIMEOUT_MS,
  });

  let buffer = '';
  let waiter: { resolve: (value: string) => void; reject: (error: Error) => void; timer: NodeJS.Timeout } | null =
    null;

  const fail = (error: Error) => {
    if (!waiter) return;
    clearTimeout(waiter.timer);
    const reject = waiter.reject;
    waiter = null;
    reject(error);
  };

  socket.on('data', (chunk: Buffer) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split(/\r?\n/).filter(Boolean);
    const last = lines[lines.length - 1] || '';
    if (!/^\d{3} /.test(last) || !waiter) return;
    const response = buffer;
    buffer = '';
    clearTimeout(waiter.timer);
    const resolve = waiter.resolve;
    waiter = null;
    resolve(response);
  });
  socket.on('error', fail);
  socket.on('timeout', () => fail(new Error('smtp timeout')));

  const read = () =>
    new Promise<string>((resolve, reject) => {
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(last)) {
        const response = buffer;
        buffer = '';
        resolve(response);
        return;
      }
      const timer = setTimeout(() => fail(new Error('smtp timeout')), TIMEOUT_MS);
      waiter = { resolve, reject, timer };
    });

  const command = async (line: string, code: string) => {
    socket.write(`${line}\r\n`);
    expectCode(await read(), code);
  };

  try {
    await new Promise<void>((resolve, reject) => {
      socket.once('secureConnect', resolve);
      socket.once('error', reject);
    });
    expectCode(await read(), '220');
    await command('EHLO karkasnik', '250');
    await command('AUTH LOGIN', '334');
    await command(Buffer.from(config.user).toString('base64'), '334');
    await command(Buffer.from(config.password).toString('base64'), '235');
    await command(`MAIL FROM:<${config.user}>`, '250');
    await command(`RCPT TO:<${config.to}>`, '250');
    await command('DATA', '354');

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const encodedFrom = `=?UTF-8?B?${Buffer.from('Каркасник').toString('base64')}?=`;
    const body = [
      `From: ${encodedFrom} <${config.user}>`,
      `To: ${config.to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      text.replace(/^\./gm, '..'),
      '.',
    ].join('\r\n');
    socket.write(`${body}\r\n`);
    expectCode(await read(), '250');
    socket.write('QUIT\r\n');
  } finally {
    socket.destroy();
  }
}

/** Sends the lead to the configured mailbox. Never throws. */
export async function notifyEmailNewLead(lead: TelegramLeadInfo): Promise<void> {
  const config = readConfig();
  if (!config) return;

  try {
    const text = formatLeadMessage(lead);
    await sendSmtp(config, `Новая заявка ${lead.id}`, text);
    console.info(`[mail] lead ${lead.id} sent`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown';
    console.error(`[mail] lead ${lead.id} failed: ${reason}`);
  }
}
