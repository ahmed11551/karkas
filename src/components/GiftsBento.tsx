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
    <section id="gifts" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6B860]/15 text-[#B27D18] dark:text-[#E6B860] text-xs font-semibold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Специальное предложение' : 'Limited Promotion'}</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight text-balance">
            {t.giftsSection.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {t.giftsSection.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenQuiz}
          className="self-start md:self-auto px-6 py-3.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-sm transition-all gold-glow flex items-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <span>{t.giftsSection.lockBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Bento Gifts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {t.giftsSection.cards.map((gift, idx) => (
          <div
            key={idx}
            className={`p-7 rounded-3xl border flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group shadow-sm ${
              gift.alt
                ? 'bg-gradient-to-br from-[#E6B860] to-[#D4A043] text-[#1E1705] border-[#E6B860] shadow-lg'
                : 'bg-gradient-to-br from-[#183B30] via-[#132E25] to-[#0E241D] text-white border-[#2F5A4B]'
            }`}
          >
            <div>
              <span
                className={`block font-display font-bold text-4xl mb-4 tracking-tight tabular-nums ${
                  gift.alt ? 'text-[#1E1705]' : 'text-[#E6B860]'
                }`}
              >
                {gift.badge}
              </span>

              <h3 className="font-display font-semibold text-lg mb-2">
                {gift.title}
              </h3>

              <p
                className={`text-sm leading-relaxed ${
                  gift.alt ? 'text-[#3D2C06]' : 'text-emerald-100/80'
                }`}
              >
                {gift.desc}
              </p>
            </div>

            <div
              className={`mt-8 pt-4 border-t flex items-center gap-1.5 text-xs font-semibold ${
                gift.alt ? 'border-[#1E1705]/15 text-[#1E1705]' : 'border-white/10 text-[#E6B860]'
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
