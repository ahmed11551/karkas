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
    <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12 sm:mb-14">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          08 · {lang === 'ru' ? 'Прямой производитель' : 'Direct Manufacturer'}
        </span>
        <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {t.inHouse.title}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed">
          {t.inHouse.subtitle}
        </p>
      </div>

      {/* Three columns separated by hairlines, no cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-ink/15 dark:border-cream/12 divide-y md:divide-y-0 md:divide-x divide-ink/15 dark:divide-cream/12">
        {t.inHouse.cards.map((card, idx) => {
          const Icon = icons[idx];
          return (
            <div key={idx} className="flex flex-col justify-between gap-10 py-10 md:py-12 md:px-8 first:md:pl-0 last:md:pr-0">
              <div>
                <div className="w-12 h-12 rounded-full border border-ink/20 dark:border-cream/20 flex items-center justify-center text-brass-ink dark:text-brass-light mb-8">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-light text-2xl sm:text-3xl leading-tight text-ink dark:text-cream mb-4">
                  {card.title}
                </h3>
                <p className="text-sm text-ink-soft dark:text-cream-soft leading-relaxed">{card.text}</p>
              </div>

              <div className="pt-5 border-t border-ink/12 dark:border-cream/10">
                <span className="block font-light text-5xl leading-none text-ink dark:text-cream tabular-nums">
                  {card.kpi}
                </span>
                <span className="eyebrow block mt-3 text-olive dark:text-cream-soft">{card.kpiLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
