import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ProcessTimelineProps {
  lang: Language;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

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

      {/* 6-Step Bento Journey */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.stepsSection.steps.map((st) => (
          <div
            key={st.num}
            className="glass-card p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative group"
          >
            <div>
              {/* Step Editorial Indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="w-10 h-10 rounded-2xl bg-[#E6B860]/20 text-[#B27D18] dark:text-[#F5C46B] font-display font-bold text-sm flex items-center justify-center group-hover:bg-[#E6B860] group-hover:text-[#1E1705] transition-colors">
                  0{st.num}
                </span>
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  Этап {st.num}
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
              <span>{st.num === 5 ? 'Монтаж на участке' : 'Гарантия договора'}</span>
              <span className="w-2 h-2 rounded-full bg-[#E6B860]/60" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
