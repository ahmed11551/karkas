import React, { useState } from 'react';
import { Lock, ShieldCheck, ShieldAlert, KeyRound, X, ArrowRight, Terminal, Database } from 'lucide-react';
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [storageMode, setStorageMode] = useState<'local' | 'session'>('local');
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

    const result = await loginAdmin(username.trim(), password, storageMode);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Авторизация в CRM Каркасник"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E6B860]/30 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#E6B860]/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#183B30] text-[#E6B860] flex items-center justify-center border border-[#2F5A4B] shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B27D18] dark:text-[#E6B860] font-semibold block">
              PROTECTED ENDPOINT · /login
            </span>
            <h3 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
              Авторизация в CRM
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
          Доступ к базе лидов защищен токеном. Кнопка «Открыть CRM» монтируется в DOM только после верификации <code className="font-mono text-[#B27D18] dark:text-[#E6B860]">admin_token</code>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Логин администратора
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Пароль администратора
              </label>
              <button
                type="button"
                onClick={() => {
                  playUiClick('tick');
                  setUsername('admin');
                  setPassword('karkas2026');
                  setError('');
                }}
                className="text-[11px] font-mono text-[#B27D18] dark:text-[#E6B860] hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Подставить: karkas2026</span>
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
              required
              autoFocus
            />
          </div>

          {/* Token Storage Selector (localStorage vs sessionStorage) */}
          <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 mb-2">
              <Database className="w-3.5 h-3.5 text-[#E6B860]" />
              <span>Хранилище токена (Token Storage):</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playUiClick('tick');
                  setStorageMode('local');
                }}
                className={`py-1.5 px-2.5 rounded-xl text-[11px] font-mono border transition-all ${
                  storageMode === 'local'
                    ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] dark:border-[#E6B860] font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                localStorage (Постоянно)
              </button>
              <button
                type="button"
                onClick={() => {
                  playUiClick('tick');
                  setStorageMode('session');
                }}
                className={`py-1.5 px-2.5 rounded-xl text-[11px] font-mono border transition-all ${
                  storageMode === 'session'
                    ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] dark:border-[#E6B860] font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                sessionStorage (Сессия)
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-xs sm:text-sm transition-all gold-glow flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Верификация токена...' : 'Войти и открыть CRM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live 403 Forbidden Security Verification Box */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#E6B860]" />
              <span>Проверка защиты базы лидов:</span>
            </span>
            <button
              type="button"
              onClick={handleRun403Test}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              GET /api/leads (без токена)
            </button>
          </div>

          {securityTestResult && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-[11px] border border-neutral-800">
              <div className="text-rose-400 font-bold">
                HTTP Status: {securityTestResult.status} Forbidden
              </div>
              <div className="text-neutral-300 mt-0.5">{securityTestResult.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
