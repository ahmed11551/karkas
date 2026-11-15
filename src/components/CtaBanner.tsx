import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CtaBannerProps {
  lang: Language;
  onOpenQuiz: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ lang, onOpenQuiz }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-forest text-cream border border-cream/10 px-7 py-14 sm:px-14 sm:py-20 lg:px-20 lg:py-24">
        {/* Blueprint grid, same motif as the hero */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #B9C4BE 1px, transparent 1px), linear-gradient(to bottom, #B9C4BE 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl">
          <span className="eyebrow inline-flex items-center gap-3 text-brass-light">
            <span className="h-px w-8 bg-brass-light/70" aria-hidden="true" />
            {lang === 'ru' ? 'Акция текущего месяца' : 'Monthly Special'}
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-cream mt-6 text-balance">
            {t.ctaBanner.title}
          </h2>

          <p className="mt-6 text-sm sm:text-base text-cream-soft leading-relaxed max-w-2xl">
            {t.ctaBanner.text}
          </p>

          <div className="mt-10">
            {/* The one gold CTA of this section */}
            <button
              onClick={onOpenQuiz}
              className="px-8 py-4 rounded-full bg-brass hover:bg-brass-hover text-[#1E1705] font-semibold text-sm transition-all gold-glow inline-flex items-center gap-2 active:scale-95"
            >
              <span>{t.ctaBanner.btn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-6 text-xs text-cream-soft/70">{t.ctaBanner.disclaimer}</p>
        </div>
      </div>
    </section>
  );
};
