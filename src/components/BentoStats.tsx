import React from 'react';
import { Compass, Flame, Zap } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface BentoStatsProps {
  lang: Language;
}

export const BentoStats: React.FC<BentoStatsProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative z-20 -mt-10 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 4-Column KPI Strip */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.builtCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.builtLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.projectsCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.projectsLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.assemblyCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.assemblyLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.warrantyCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.warrantyLabel}
          </span>
        </div>
      </div>

      {/* Bento Grid: Three Reasons Why Houses Cost Less */}
      <div className="mt-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-neutral-900 dark:text-neutral-50 text-balance">
            {t.reasons.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            {t.reasons.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ready Designs */}
          <div className="glass-card p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E6B860]/15 flex items-center justify-center text-[#B27D18] dark:text-[#F5C46B] mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#F5C46B] uppercase">
                {t.reasons.cards[0].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-neutral-900 dark:text-neutral-100 mt-2 mb-3">
                {t.reasons.cards[0].title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.reasons.cards[0].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Каталог типовых проектов' : 'Standardized catalog'}</span>
              <span className="font-mono text-[#B27D18] dark:text-[#F5C46B]">−35% затрат</span>
            </div>
          </div>

          {/* Card 2: All Season Warmth (Featured Middle Bento) */}
          <div className="bg-gradient-to-br from-[#183B30] to-[#0E251E] text-white p-7 rounded-3xl border border-[#2F5A4B] shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#E6B860] mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#E6B860] uppercase">
                {t.reasons.cards[1].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-white mt-2 mb-3">
                {t.reasons.cards[1].title}
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                {t.reasons.cards[1].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-200/70 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Плиты базальтовой ваты' : 'Basalt mineral wool'}</span>
              <span className="font-mono text-[#E6B860]">100 / 150 / 200 мм</span>
            </div>
          </div>

          {/* Card 3: Screw Pile Foundation */}
          <div className="glass-card p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E6B860]/15 flex items-center justify-center text-[#B27D18] dark:text-[#F5C46B] mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#F5C46B] uppercase">
                {t.reasons.cards[2].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-neutral-900 dark:text-neutral-100 mt-2 mb-3">
                {t.reasons.cards[2].title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.reasons.cards[2].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Монтаж за 1 день' : '1-day installation'}</span>
              <span className="font-mono text-[#B27D18] dark:text-[#F5C46B]">Скидка 50%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
