import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(0); // First open by default

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 sm:mb-14">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          11 · {lang === 'ru' ? 'Ответы на главные вопросы' : 'Answers & Clarity'}
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {t.faq.title}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed">
          {t.faq.subtitle}
        </p>
      </div>

      {/* Ruled accordion: hairlines between items, no cards */}
      <div className="border-t border-ink/15 dark:border-cream/12">
        {t.faq.items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border-b border-ink/15 dark:border-cream/12">
              <button
                onClick={() => toggleAccordion(idx)}
                className="group w-full text-left py-6 sm:py-7 flex items-start justify-between gap-6 text-ink dark:text-cream transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex items-baseline gap-4 sm:gap-6">
                  <span className="font-serif italic text-lg sm:text-xl text-olive dark:text-cream-soft tabular-nums shrink-0 w-8 sm:w-10">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-serif text-2xl sm:text-3xl leading-snug transition-colors ${
                      isOpen ? 'text-ink dark:text-cream' : 'text-ink-soft dark:text-cream-soft group-hover:text-ink dark:group-hover:text-cream'
                    }`}
                  >
                    {item.q}
                  </span>
                </span>
                <span
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isOpen
                      ? 'border-ink bg-ink text-paper dark:border-cream dark:bg-cream dark:text-forest'
                      : 'border-ink/25 text-ink dark:border-cream/30 dark:text-cream group-hover:border-ink/60 dark:group-hover:border-cream/60'
                  }`}
                  aria-hidden="true"
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="pb-7 sm:pb-8 pl-12 sm:pl-16 pr-12 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed max-w-2xl">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
