import React from 'react';
import { Factory, Truck, Users } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface InHouseAdvantageProps {
  lang: Language;
}

export const InHouseAdvantage: React.FC<InHouseAdvantageProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const icons = [Factory, Truck, Users];

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
          {lang === 'ru' ? 'Прямой производитель' : 'Direct Manufacturer'}
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
          {t.inHouse.title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          {t.inHouse.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.inHouse.cards.map((card, idx) => {
          const Icon = icons[idx];
          return (
            <div
              key={idx}
              className="glass-card p-8 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle top gold accent hairline */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#E6B860] opacity-80" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E6B860]/15 flex items-center justify-center text-[#B27D18] dark:text-[#F5C46B] mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-display font-semibold text-xl text-neutral-900 dark:text-neutral-100 mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {card.text}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <span className="block font-display font-bold text-2xl text-[#142E25] dark:text-[#E6B860] tracking-tight">
                  {card.kpi}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {card.kpiLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
