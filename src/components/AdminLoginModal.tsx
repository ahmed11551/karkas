import React, { useState } from 'react';
import { Lock, ShieldCheck, ShieldAlert, X, ArrowRight, Terminal } from 'lucide-react';
import { loginAdmin, testUnauthorizedRequest } from '../utils/leads';
import { playUiClick } from '../utils/sound';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [securityTestResult, setSecurityTestResult] = useState<{
    status: number;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    playUiClick('tap');

    const result = await loginAdmin(username.trim(), password, remember);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Неверный логин или пароль');
      return;
    }

    // Request browser notification permission for real-time lead alerts
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }

    playUiClick('success');
    onSuccess();
    onClose();
  };

  const handleRun403Test = async () => {
    playUiClick('tick');
    const res = await testUnauthorizedRequest();
    setSecurityTestResult(res);
  };

  // Light paper sheet in both themes, like the other modals.
  const labelClass = 'block eyebrow text-ink-soft mb-2';
  const inputClass =
    'w-full px-4 py-3.5 rounded-xl bg-white border border-ink/20 text-sm text-ink placeholder:text-olive/70 focus:outline-none focus:border-ink focus:ring-2 focus:ring-brass/40';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Авторизация в CRM Каркасник"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-9 shadow-2xl bg-paper text-ink border border-ink/15 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-olive hover:text-ink hover:bg-ink/5 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-7 pr-8">
          <div className="w-11 h-11 rounded-full border border-ink/20 text-brass-ink flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-brass-ink font-semibold">
              PROTECTED ENDPOINT · /login
            </span>
            <h3 className="font-serif text-3xl leading-tight text-ink mt-1">Авторизация в CRM</h3>
          </div>
        </div>

        <p className="text-xs text-ink-soft leading-relaxed mb-6">
          Сессия хранится в HttpOnly-cookie и не попадает в JavaScript. Кнопка «Открыть CRM» появляется только после проверки сессии на сервере.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-username" className={labelClass}>
              Логин администратора
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={64}
              placeholder="Логин"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className={labelClass}>
              Пароль администратора
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={256}
              placeholder="••••••••••"
              className={inputClass}
              required
              autoFocus
            />
          </div>

          <label htmlFor="admin-remember" className="flex items-center gap-2.5 text-xs text-ink-soft cursor-pointer">
            <input
              id="admin-remember"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-[#183B30]"
            />
            <span>Запомнить на этом устройстве (7 дней)</span>
          </label>

          {error && (
            <div className="p-3 rounded-xl border border-danger/30 bg-danger/5 text-xs text-danger flex items-center gap-2" role="alert">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* The one gold CTA of the modal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-brass hover:bg-brass-hover text-[#1E1705] font-semibold text-sm transition-all gold-glow flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Проверка входа...' : 'Войти и открыть CRM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live 403 check of the leads endpoint */}
        <div className="mt-7 pt-5 border-t border-ink/12">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-olive flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-brass-ink" />
              <span>Проверка защиты базы лидов:</span>
            </span>
            <button
              type="button"
              onClick={handleRun403Test}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-ink/20 hover:bg-ink hover:text-paper text-ink transition-colors"
            >
              GET /api/leads (без токена)
            </button>
          </div>

          {securityTestResult && (
            <div className="mt-3 p-3 rounded-xl bg-forest text-cream-soft font-mono text-[11px]">
              <div className="text-brass-light font-bold">HTTP Status: {securityTestResult.status} Forbidden</div>
              <div className="mt-0.5 text-cream-soft/90">{securityTestResult.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
