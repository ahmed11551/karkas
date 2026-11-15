import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ProcessTimelineProps {
  lang: Language;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);

  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const timeouts: number[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Staggered sequential reveal for each of the 6 construction steps
            t.stepsSection.steps.forEach((st, idx) => {
              const timerId = window.setTimeout(() => {
                setRevealedSteps((prev) => (prev.includes(st.num) ? prev : [...prev, st.num]));
              }, idx * 130);
              timeouts.push(timerId);
            });
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [t.stepsSection.steps]);

  return (
    <section id="steps" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header: editorial, left aligned */}
      <div className="max-w-3xl mb-12 sm:mb-14">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          07 · {lang === 'ru' ? 'Простой и прозрачный путь' : 'Simple & Transparent Path'}
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {t.stepsSection.title}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed max-w-2xl">
          {t.stepsSection.subtitle}
        </p>
      </div>

      {/* Six steps as a ruled grid: hairlines instead of cards */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15 dark:border-cream/12"
      >
        {t.stepsSection.steps.map((st, idx) => {
          const isRevealed = revealedSteps.includes(st.num);
          const numeral = `0${st.num}`;
          return (
            <div
              key={st.num}
              style={{ transitionDelay: `${idx * 45}ms` }}
              className={`group relative flex flex-col justify-between p-7 sm:p-8 min-h-[280px] border-r border-b border-ink/15 dark:border-cream/12 overflow-hidden transition-all duration-700 ease-out ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Progress hairline draws across the top on reveal */}
              <span
                aria-hidden="true"
                className={`absolute top-0 left-0 h-[2px] bg-brass transition-all duration-1000 ease-out ${
                  isRevealed ? 'w-full' : 'w-0'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-4 mb-8">
                  <span className="font-serif italic text-6xl leading-none text-olive dark:text-cream-soft transition-colors duration-500 group-hover:text-brass-ink dark:group-hover:text-brass-light">
                    {numeral}
                  </span>
                  <span className="eyebrow text-olive dark:text-cream-soft pt-2">
                    {lang === 'ru' ? `Этап ${st.num} / 6` : `Step ${st.num} / 6`}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-[1.7rem] leading-tight text-ink dark:text-cream mb-3">
                  {st.title}
                </h3>
                <p className="text-sm text-ink-soft dark:text-cream-soft leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-ink/12 dark:border-cream/10 flex items-center justify-between gap-3 text-xs text-olive dark:text-cream-soft">
                <span>
                  {st.num === 5
                    ? lang === 'ru'
                      ? 'Монтаж на участке'
                      : 'On-site assembly'
                    : lang === 'ru'
                      ? 'Гарантия договора'
                      : 'Contract guarantee'}
                </span>
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    isRevealed ? 'bg-brass' : 'bg-brass/30'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
