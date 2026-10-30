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
    <section id="steps" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
          {lang === 'ru' ? 'Простой и прозрачный путь' : 'Simple & Transparent Path'}
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
          {t.stepsSection.title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          {t.stepsSection.subtitle}
        </p>
      </div>

      {/* 6-Step Bento Journey with Intersection Observer Staggered Reveal */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.stepsSection.steps.map((st, idx) => {
          const isRevealed = revealedSteps.includes(st.num);
          return (
            <div
              key={st.num}
              style={{
                transitionDelay: `${idx * 45}ms`,
              }}
              className={`glass-card p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-700 ease-out relative group overflow-hidden ${
                isRevealed
                  ? 'opacity-100 translate-y-0 scale-100 blur-0'
                  : 'opacity-0 translate-y-10 scale-[0.96] blur-[2px]'
              }`}
            >
              {/* Animated Top Progress Bar on Reveal */}
              <div
                className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-[#183B30] via-[#E6B860] to-transparent transition-all duration-1000 ease-out ${
                  isRevealed ? 'w-full opacity-90' : 'w-0 opacity-0'
                }`}
              />

              <div>
                {/* Step Editorial Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-[#E6B860]/20 text-[#B27D18] dark:text-[#F5C46B] font-display font-bold text-sm flex items-center justify-center group-hover:bg-[#E6B860] group-hover:text-[#1E1705] transition-colors shadow-xs">
                    0{st.num}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {lang === 'ru' ? `Этап ${st.num} / 6` : `Step ${st.num} / 6`}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2.5">
                  {st.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between text-xs text-neutral-500">
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
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    isRevealed ? 'bg-[#E6B860] shadow-[0_0_8px_#E6B860]' : 'bg-[#E6B860]/30'
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
