import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Globe, Volume2, VolumeX } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG } from '../config/company';
import { toggleSoundMute, playUiClick } from '../utils/sound';
import { Logo } from './Logo';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenQuiz: () => void;
  isScrolled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenQuiz,
  isScrolled,
}) => {
  const t = TRANSLATIONS[lang];
  const [isMuted, setIsMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const solid = isScrolled || menuOpen;

  const onHome = window.location.pathname === '/';
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);
  const sections = [
    { href: '/proekty/', label: t.nav.projects },
    { href: sectionHref('#calculator'), label: t.nav.calculator },
    { href: sectionHref('#materials'), label: t.nav.materials },
    { href: sectionHref('#steps'), label: t.nav.steps },
    { href: sectionHref('#gifts'), label: t.nav.gifts },
    { href: sectionHref('#faq'), label: t.nav.faq },
    { href: '/kontakty/', label: lang === 'ru' ? 'Контакты' : 'Contacts' },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    const wide = window.matchMedia('(min-width: 1024px)');
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      wide.removeEventListener('change', onWide);
    };
  }, [menuOpen]);

  const handleSoundToggle = () => {
    const muted = toggleSoundMute();
    setIsMuted(muted);
    if (!muted) playUiClick('tap');
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-paper dark:bg-forest border-b border-ink/10 dark:border-cream/10 py-3.5'
          : 'bg-transparent py-5 header-on-hero'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 md:gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="/"
            className="hdr-ink text-[17px] sm:text-[1.35rem] md:text-[1.5rem] leading-none text-neutral-900 dark:text-neutral-50 hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
          >
            <Logo name={t.brandName} compact />
          </a>

          {/* Zone 2: Navigation Links (Single-line, 4-5 items) */}
          <nav className="hdr-soft hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <a
              href="/proekty/"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.projects}
            </a>
            <a
              href={sectionHref('#calculator')}
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.calculator}
            </a>
            <a
              href={sectionHref('#materials')}
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.materials}
            </a>
            <a
              href={sectionHref('#steps')}
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.steps}
            </a>
            <a
              href={sectionHref('#gifts')}
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.gifts}
            </a>
            <a
              href={sectionHref('#faq')}
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.faq}
            </a>
            <a
              href="/kontakty/"
              className="hover:text-pine dark:hover:text-brass-light transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'ru' ? 'Контакты' : 'Contacts'}
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

            <button
              type="button"
              onClick={() => {
                playUiClick('tap');
                setMenuOpen((open) => !open);
              }}
              aria-expanded={menuOpen}
              aria-controls="section-menu"
              className={`lg:hidden px-2.5 py-1.5 text-xs font-medium rounded-[10px] border transition-colors ${
                solid
                  ? 'border-ink/20 text-ink dark:border-cream/20 dark:text-cream'
                  : 'bg-cream/90 text-forest border-transparent'
              }`}
            >
              {menuOpen ? (lang === 'ru' ? 'Закрыть' : 'Close') : lang === 'ru' ? 'Разделы' : 'Menu'}
            </button>

            {/* Sound Effects Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label={lang === 'ru' ? 'Переключить звуки интерфейса' : 'Toggle interface sounds'}
              className="hdr-util hidden lg:inline-flex p-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
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
              className="hdr-util hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
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
              className="hdr-util hidden lg:inline-flex p-1.5 rounded-[10px] border border-ink/20 dark:border-cream/20 bg-transparent hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F5C46B]" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                playUiClick('tap');
                onOpenQuiz();
              }}
              className={`px-2.5 sm:px-4 py-2 text-xs md:text-sm font-medium rounded-[12px] transition-colors active:scale-[0.98] whitespace-nowrap ${
                solid
                  ? 'bg-forest text-cream hover:bg-forest-raised dark:bg-cream dark:text-forest dark:hover:bg-cream-soft'
                  : 'bg-cream text-forest hover:bg-cream-soft'
              }`}
            >
              {lang === 'ru' ? 'Рассчитать цену' : 'Get Quote'}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav id="section-menu" className="lg:hidden border-t border-ink/10 dark:border-cream/10 bg-paper dark:bg-forest">
          <div className="max-w-7xl mx-auto px-4 pt-1 pb-4">
            {sections.map((section, index) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline justify-between gap-4 py-3.5 border-b border-ink/10 dark:border-cream/10 text-lg text-ink dark:text-cream"
              >
                <span>{section.label}</span>
                <span className="font-mono text-[11px] tracking-[0.14em] text-olive dark:text-cream-soft">
                  0{index + 1}
                </span>
              </a>
            ))}
            <div className="flex items-center justify-between gap-3 pt-4">
              <a href={COMPANY_CONFIG.phoneHref} className="text-sm font-medium text-ink dark:text-cream">
                {COMPANY_CONFIG.phoneDisplay}
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  aria-label={lang === 'ru' ? 'Переключить звуки интерфейса' : 'Toggle interface sounds'}
                  className="p-2 rounded-[10px] border border-ink/15 dark:border-cream/15 text-ink dark:text-cream"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiClick('tap');
                    onToggleLang();
                  }}
                  aria-label={lang === 'ru' ? 'Переключить язык' : 'Switch language'}
                  className="px-2.5 py-2 rounded-[10px] border border-ink/15 dark:border-cream/15 text-xs font-semibold uppercase text-ink dark:text-cream"
                >
                  {lang}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiClick('tap');
                    onToggleTheme();
                  }}
                  aria-label={lang === 'ru' ? 'Переключить цветовую тему' : 'Toggle color theme'}
                  className="p-2 rounded-[10px] border border-ink/15 dark:border-cream/15 text-ink dark:text-cream"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
