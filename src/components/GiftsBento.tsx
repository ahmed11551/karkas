import React from 'react';
import { Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface GiftsBentoProps {
  lang: Language;
  onOpenQuiz: () => void;
}

export const GiftsBento: React.FC<GiftsBentoProps> = ({ lang, onOpenQuiz }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="gifts" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-3xl">
          <span className="eyebrow inline-flex items-center gap-2 text-brass-ink dark:text-brass-light">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              10 · {lang === 'ru' ? 'Специальное предложение' : 'Limited Promotion'}
            </span>
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
            {t.giftsSection.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-2xl leading-relaxed">
            {t.giftsSection.subtitle}
          </p>
        </div>

        {/* The one gold CTA of this section */}
        <button
          onClick={onOpenQuiz}
          className="self-start md:self-auto px-6 py-3.5 rounded-full bg-brass hover:bg-brass-hover text-[#1E1705] font-semibold text-sm transition-all gold-glow flex items-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <span>{t.giftsSection.lockBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Four-card bento: forest cards, one light card for the fixed gift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {t.giftsSection.cards.map((gift, idx) => (
          <div
            key={idx}
            className={`p-7 rounded-2xl border flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 ${
              gift.alt
                ? 'bg-paper-deep dark:bg-cream text-ink dark:text-forest border-ink/20'
                : 'bg-forest text-cream border-cream/10 dark:border-cream/12'
            }`}
          >
            <div>
              <span
                className={`block font-serif italic text-6xl leading-none mb-6 tabular-nums ${
                  gift.alt ? 'text-ink dark:text-forest' : 'text-brass-light'
                }`}
              >
                {gift.badge}
              </span>

              <h3 className="font-serif text-2xl leading-tight mb-3">{gift.title}</h3>

              <p
                className={`text-sm leading-relaxed ${
                  gift.alt ? 'text-ink-soft dark:text-forest/75' : 'text-cream-soft'
                }`}
              >
                {gift.desc}
              </p>
            </div>

            <div
              className={`mt-8 pt-4 border-t flex items-center gap-2 eyebrow ${
                gift.alt
                  ? 'border-ink/15 dark:border-forest/20 text-ink dark:text-forest'
                  : 'border-cream/12 text-brass-light'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {gift.alt
                  ? lang === 'ru'
                    ? 'Фиксируется в квизе'
                    : 'Select in quiz'
                  : lang === 'ru'
                  ? 'Включено в договор'
                  : 'Included in contract'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
