import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CtaBannerProps {
  lang: Language;
  onOpenQuiz: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ lang, onOpenQuiz }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#183B30] via-[#122A21] to-[#0A1813] text-white p-8 sm:p-14 lg:p-16 border border-[#2F5A4B] shadow-2xl text-center">
        {/* Ambient decorative radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E6B860]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E6B860] text-xs font-semibold mb-6 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Акция текущего месяца' : 'Monthly Special'}</span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight text-balance">
            {t.ctaBanner.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            {t.ctaBanner.text}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenQuiz}
              className="px-8 py-4 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-sm transition-all gold-glow inline-flex items-center gap-2 active:scale-95"
            >
              <span>{t.ctaBanner.btn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-6 text-xs text-emerald-200/50">
            {t.ctaBanner.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
};
