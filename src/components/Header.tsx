import React, { useState } from 'react';
import { Sun, Moon, Globe, Phone, Volume2, VolumeX, Shield } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG } from '../config/company';
import { toggleSoundMute, playUiClick } from '../utils/sound';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenQuiz: () => void;
  onOpenCrm: () => void;
  isAdminAuthenticated: boolean;
  newLeadsCount?: number;
  isScrolled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenQuiz,
  onOpenCrm,
  isAdminAuthenticated,
  newLeadsCount = 0,
  isScrolled,
}) => {
  const t = TRANSLATIONS[lang];
  const [isMuted, setIsMuted] = useState(false);

  const handleSoundToggle = () => {
    const muted = toggleSoundMute();
    setIsMuted(muted);
    if (!muted) playUiClick('tap');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F4F2EC]/90 dark:bg-[#0B1512]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-sm py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="#"
            className="flex items-center gap-2.5 font-display font-semibold text-lg md:text-xl tracking-tight text-neutral-900 dark:text-neutral-50 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <span className="w-3.5 h-3.5 rounded-sm rounded-br-none bg-[#E6B860] shrink-0" />
            <span>{t.brandName}</span>
          </a>

          {/* Zone 2: Navigation Links (Single-line, 4-5 items) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <a
              href="#catalog"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.projects}
            </a>
            <a
              href="#calculator"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.calculator}
            </a>
            <a
              href="#materials"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.materials}
            </a>
            <a
              href="#steps"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.steps}
            </a>
            <a
              href="#gifts"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.gifts}
            </a>
            <a
              href="#faq"
              className="hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.faq}
            </a>
          </nav>

          {/* Zone 3: Primary Action & Compact Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Direct Phone link */}
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="hidden sm:flex flex-col items-end text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-[#184534] dark:hover:text-[#E6B860] transition-colors mr-1"
            >
              <span className="font-sans text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {COMPANY_CONFIG.phoneDisplay}
              </span>
              <span className="text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                {t.phoneSchedule}
              </span>
            </a>

            {/* Sound Effects Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label="Переключить звуки интерфейса"
              className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              title={isMuted ? 'Включить звуковые эффекты' : 'Выключить звуки'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#B27D18] dark:text-[#E6B860]" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                playUiClick('tap');
                onToggleLang();
              }}
              aria-label="Switch language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#E6B860]" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => {
                playUiClick('tap');
                onToggleTheme();
              }}
              aria-label="Toggle color theme"
              className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F5C46B]" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* STRICT DOM SECURITY: CRM Button exists in DOM ONLY when Admin is authenticated with valid admin_token */}
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  playUiClick('tap');
                  onOpenCrm();
                }}
                className="relative px-3 py-1.5 rounded-lg border border-[#E6B860] bg-[#183B30] text-[#E6B860] hover:bg-[#1E4739] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Открыть защищенную CRM-панель заявок"
              >
                <Shield className="w-3.5 h-3.5 text-[#E6B860]" />
                <span className="hidden md:inline">Открыть CRM</span>
                {newLeadsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E6B860] text-[#1E1705] font-mono text-[10px] font-bold">
                    {newLeadsCount}
                  </span>
                )}
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => {
                playUiClick('tap');
                onOpenQuiz();
              }}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] gold-glow transition-all transform active:scale-95 whitespace-nowrap"
            >
              {lang === 'ru' ? 'Рассчитать цену' : 'Get Quote'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
