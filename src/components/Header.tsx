import React, { useState } from 'react';
import { Sun, Moon, Globe, Volume2, VolumeX, Shield } from 'lucide-react';
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
          ? 'bg-paper/95 dark:bg-forest/95 border-b border-ink/10 dark:border-cream/10 py-3.5'
          : 'bg-transparent py-5 header-on-hero'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 md:gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="#"
            className="hdr-ink flex items-center gap-2.5 font-logo text-xl sm:text-2xl md:text-[1.75rem] leading-none tracking-[-0.01em] text-neutral-900 dark:text-neutral-50 hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-brass shrink-0" />
            <span>{t.brandName}</span>
          </a>

          {/* Zone 2: Navigation Links (Single-line, 4-5 items) */}
          <nav className="hdr-soft hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <a
              href="#catalog"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.projects}
            </a>
            <a
              href="#calculator"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.calculator}
            </a>
            <a
              href="#materials"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.materials}
            </a>
            <a
              href="#steps"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.steps}
            </a>
            <a
              href="#gifts"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.gifts}
            </a>
            <a
              href="#faq"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.faq}
            </a>
          </nav>

          {/* Zone 3: Primary Action & Compact Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Phone link */}
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="hdr-ink hidden sm:flex flex-col items-end text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-pine dark:hover:text-brass-light transition-colors mr-1"
            >
              <span className="hdr-ink font-sans text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {COMPANY_CONFIG.phoneDisplay}
              </span>
              <span className="hdr-soft text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                {t.phoneSchedule}
              </span>
            </a>

            {/* Sound Effects Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label={lang === 'ru' ? 'Переключить звуки интерфейса' : 'Toggle interface sounds'}
              className="hdr-util p-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              title={isMuted ? 'Включить звуковые эффекты' : 'Выключить звуки'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#8A5F0C] dark:text-brass" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                playUiClick('tap');
                onToggleLang();
              }}
              aria-label={lang === 'ru' ? 'Переключить язык' : 'Switch language'}
              className="hdr-util flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Globe className="hidden sm:block w-3.5 h-3.5 text-pine dark:text-brass" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => {
                playUiClick('tap');
                onToggleTheme();
              }}
              aria-label={lang === 'ru' ? 'Переключить цветовую тему' : 'Toggle color theme'}
              className="hdr-util p-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
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
                className="relative px-3 py-1.5 rounded-[10px] border border-brass bg-forest-raised text-brass hover:bg-forest text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Открыть защищенную CRM-панель заявок"
              >
                <Shield className="w-3.5 h-3.5 text-brass" />
                <span className="hidden md:inline">Открыть CRM</span>
                {newLeadsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-[12px] bg-brass text-ink font-mono text-[10px] font-bold">
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
              className={`px-2.5 sm:px-4 py-2 text-xs md:text-sm font-medium rounded-[12px] transition-colors active:scale-[0.98] whitespace-nowrap ${
                isScrolled
                  ? 'bg-forest text-cream hover:bg-forest-raised dark:bg-cream dark:text-forest dark:hover:bg-cream-soft'
                  : 'bg-cream text-forest hover:bg-cream-soft'
              }`}
            >
              {lang === 'ru' ? 'Рассчитать цену' : 'Get Quote'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
