import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

/** Construction drawings, one stroke. Not a circled pictogram. */
function ReasonMark({ kind }: { kind: 'plan' | 'wall' | 'piles' }) {
  const props = {
    viewBox: '0 0 48 48',
    fill: 'none',
    'aria-hidden': true as const,
    className: 'w-11 h-11',
  };
  if (kind === 'plan') {
    return (
      <svg {...props}>
        <rect x="5.5" y="7.5" width="37" height="33" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 24.5 H30.5 V40.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M22 7.5 V18" stroke="currentColor" strokeWidth="1.4" />
        <path d="M30.5 40.5 H38" stroke="currentColor" strokeWidth="1.4" />
        <path d="M38 40.5 A7.5 7.5 0 0 0 30.5 33" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === 'wall') {
    return (
      <svg {...props}>
        <rect x="8" y="6" width="32" height="36" stroke="currentColor" strokeWidth="1.4" />
        <path d="M16 6 V42 M32 6 V42" stroke="currentColor" strokeWidth="1.4" />
        <path d="M18.5 14 H29.5 M18.5 20 H29.5 M18.5 26 H29.5 M18.5 32 H29.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M6 12 H42" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 12 V38 M32 12 V38" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 18 H19 M13 24 H19 M13 30 H19 M13 36 H19" stroke="currentColor" strokeWidth="1.2" />
      <path d="M29 18 H35 M29 24 H35 M29 30 H35 M29 36 H35" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13.5 38 L16 43 L18.5 38 M29.5 38 L32 43 L34.5 38" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="miter" />
    </svg>
  );
}

interface BentoStatsProps {
  lang: Language;
}

export const BentoStats: React.FC<BentoStatsProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const kpis = [
    { value: t.stats.builtCount, label: t.stats.builtLabel },
    { value: t.stats.projectsCount, label: t.stats.projectsLabel },
    { value: t.stats.assemblyCount, label: t.stats.assemblyLabel },
    { value: t.stats.warrantyCount, label: t.stats.warrantyLabel },
  ];

  return (
    <section
      className="relative z-20 -mt-6 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* KPI row: editorial hairlines instead of a boxed card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-ink/15 dark:border-cream/12">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`py-7 sm:py-9 px-4 sm:px-7 ${
              i % 2 === 1 ? 'border-l border-ink/15 dark:border-cream/12' : ''
            } ${
              i >= 2 ? 'border-t border-ink/15 dark:border-cream/12' : ''
            } lg:border-t-0 ${
              i > 0 ? 'lg:border-l lg:border-ink/15 dark:lg:border-cream/12' : ''
            }`}
          >
            <span className="block font-light text-4xl sm:text-5xl lg:text-6xl leading-none tracking-[-0.02em] text-ink dark:text-cream tabular-nums">
              {kpi.value}
            </span>
            <span className="block text-xs sm:text-sm text-ink-soft dark:text-cream-soft mt-3">
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      {/* Section heading: numbered, editorial */}
      <div className="mt-20 sm:mt-24 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <span className="eyebrow text-brass-ink dark:text-brass-light">
            01 · {lang === 'ru' ? 'Почему дешевле' : 'Why it costs less'}
          </span>
          <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
            {t.reasons.title}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-sm md:text-right leading-relaxed">
          {t.reasons.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {/* Card 1: Ready Designs (Lottie: Blueprint -> House) */}
        <div className="flex flex-col justify-between p-7 sm:p-8 rounded-[20px] border border-ink/12 dark:border-cream/10 bg-paper dark:bg-forest-raised">
          <div>
            <div className="flex items-start justify-between mb-8 text-brass-ink dark:text-brass-light">
              <ReasonMark kind="plan" />
              <span className="font-light text-2xl text-olive dark:text-cream-soft">01</span>
            </div>
            <span className="eyebrow text-brass-ink dark:text-brass-light">
              {t.reasons.cards[0].tag}
            </span>
            <h3 className="font-light text-3xl leading-tight text-ink dark:text-cream mt-3 mb-3">
              {t.reasons.cards[0].title}
            </h3>
            <p className="text-sm sm:text-[15px] leading-relaxed text-ink-soft dark:text-cream-soft">
              {t.reasons.cards[0].text}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-ink/12 dark:border-cream/10 flex items-center justify-between text-xs text-olive dark:text-cream-soft">
            <span>{lang === 'ru' ? 'Каталог типовых проектов' : 'Standardized catalog'}</span>
            <span className="font-mono font-semibold text-brass-ink dark:text-brass-light">−35% затрат</span>
          </div>
        </div>

        {/* Card 2: All Season Warmth, the dark card of the trio (Lottie: Snowflake -> Sun) */}
        <div className="flex flex-col justify-between p-7 sm:p-8 rounded-[20px] border border-cream/10 bg-forest text-cream dark:bg-forest-raised">
          <div>
            <div className="flex items-start justify-between mb-8 text-brass-light">
              <ReasonMark kind="wall" />
              <span className="font-light text-2xl text-cream-soft">02</span>
            </div>
            <span className="eyebrow text-brass-light">{t.reasons.cards[1].tag}</span>
            <h3 className="font-light text-3xl leading-tight text-cream mt-3 mb-3">
              {t.reasons.cards[1].title}
            </h3>
            <p className="text-sm sm:text-[15px] leading-relaxed text-cream-soft">
              {t.reasons.cards[1].text}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-cream/10 flex items-center justify-between text-xs text-cream-soft">
            <span>{lang === 'ru' ? 'Плиты базальтовой ваты' : 'Basalt mineral wool'}</span>
            <span className="font-mono font-semibold text-brass-light">100 / 150 / 200 мм</span>
          </div>
        </div>

        {/* Card 3: Screw Pile Foundation (Lottie: Pile Driven + Protection Shield) */}
        <div className="flex flex-col justify-between p-7 sm:p-8 rounded-[20px] border border-ink/12 dark:border-cream/10 bg-paper dark:bg-forest-raised">
          <div>
            <div className="flex items-start justify-between mb-8 text-brass-ink dark:text-brass-light">
              <ReasonMark kind="piles" />
              <span className="font-light text-2xl text-olive dark:text-cream-soft">03</span>
            </div>
            <span className="eyebrow text-brass-ink dark:text-brass-light">
              {t.reasons.cards[2].tag}
            </span>
            <h3 className="font-light text-3xl leading-tight text-ink dark:text-cream mt-3 mb-3">
              {t.reasons.cards[2].title}
            </h3>
            <p className="text-sm sm:text-[15px] leading-relaxed text-ink-soft dark:text-cream-soft">
              {t.reasons.cards[2].text}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-ink/12 dark:border-cream/10 flex items-center justify-between text-xs text-olive dark:text-cream-soft">
            <span>{lang === 'ru' ? 'Монтаж за 1 день' : '1-day installation'}</span>
            <span className="font-mono font-semibold text-brass-ink dark:text-brass-light">Скидка 50%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
