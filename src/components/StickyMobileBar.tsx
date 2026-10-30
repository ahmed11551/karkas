import React from 'react';
import { Phone, Calculator } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG } from '../config/company';

interface StickyMobileBarProps {
  lang: Language;
  onOpenQuiz: () => void;
  isVisible: boolean;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  lang,
  onOpenQuiz,
  isVisible,
}) => {
  const t = TRANSLATIONS[lang];

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 transition-all duration-300">
      <div className="glass-panel p-2 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2">
        <a
          href={COMPANY_CONFIG.phoneHref}
          className="p-3 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center shrink-0"
          aria-label={t.sticky.call}
        >
          <Phone className="w-5 h-5 text-[#B27D18] dark:text-[#E6B860]" />
        </a>

        <button
          onClick={onOpenQuiz}
          className="flex-1 py-3 px-4 rounded-xl bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-xs tracking-tight transition-all gold-glow flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4 shrink-0" />
          <span>{t.sticky.calculate}</span>
        </button>
      </div>
    </div>
  );
};
