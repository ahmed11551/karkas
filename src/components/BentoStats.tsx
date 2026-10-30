import React, { useEffect, useRef, useState } from 'react';
import { Lottie, LottieHandle } from 'lottie-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  blueprintHouseLottie,
  seasonalHouseLottie,
  pileShieldLottie,
} from '../data/lottieAnimations';

interface BentoStatsProps {
  lang: Language;
}

export const BentoStats: React.FC<BentoStatsProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const lottieRef1 = useRef<LottieHandle>(null);
  const lottieRef2 = useRef<LottieHandle>(null);
  const lottieRef3 = useRef<LottieHandle>(null);

  // Sync Lottie playback with scroll via IntersectionObserver (synced with Lenis)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            // Set a calm, subtle playback speed for continuous luxury feel
            lottieRef1.current?.setSpeed(0.65);
            lottieRef2.current?.setSpeed(0.55);
            lottieRef3.current?.setSpeed(0.65);
            lottieRef1.current?.play();
            lottieRef2.current?.play();
            lottieRef3.current?.play();
          } else {
            lottieRef1.current?.pause();
            lottieRef2.current?.pause();
            lottieRef3.current?.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 -mt-10 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* 4-Column KPI Strip */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.builtCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.builtLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.projectsCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.projectsLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.assemblyCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.assemblyLabel}
          </span>
        </div>

        <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800/80 pl-4 sm:pl-6">
          <div className="flex items-baseline gap-1 text-[#142E25] dark:text-[#E6B860]">
            <span className="font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
              {t.stats.warrantyCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
            {t.stats.warrantyLabel}
          </span>
        </div>
      </div>

      {/* Bento Grid: Three Reasons Why Houses Cost Less (with Lottie JSON Animations) */}
      <div className="mt-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-neutral-900 dark:text-neutral-50 text-balance">
            {t.reasons.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            {t.reasons.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ready Designs (Lottie: Blueprint -> House) */}
          <div
            onMouseEnter={() => {
              lottieRef1.current?.setSpeed(1.1);
              lottieRef1.current?.seek(0);
              lottieRef1.current?.play();
            }}
            onMouseLeave={() => {
              lottieRef1.current?.setSpeed(0.65);
            }}
            className="glass-card p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#E6B860]/15 border border-[#E6B860]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform overflow-hidden">
                <Lottie
                  lottieRef={lottieRef1}
                  src={blueprintHouseLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#F5C46B] uppercase">
                {t.reasons.cards[0].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-neutral-900 dark:text-neutral-100 mt-2 mb-3">
                {t.reasons.cards[0].title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.reasons.cards[0].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Каталог типовых проектов' : 'Standardized catalog'}</span>
              <span className="font-mono text-[#B27D18] dark:text-[#F5C46B]">−35% затрат</span>
            </div>
          </div>

          {/* Card 2: All Season Warmth (Lottie: Snowflake -> Sun around House) */}
          <div
            onMouseEnter={() => {
              lottieRef2.current?.setSpeed(1.1);
              lottieRef2.current?.seek(0);
              lottieRef2.current?.play();
            }}
            onMouseLeave={() => {
              lottieRef2.current?.setSpeed(0.55);
            }}
            className="bg-gradient-to-br from-[#183B30] to-[#0E251E] text-white p-7 rounded-3xl border border-[#2F5A4B] shadow-xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform overflow-hidden">
                <Lottie
                  lottieRef={lottieRef2}
                  src={seasonalHouseLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#E6B860] uppercase">
                {t.reasons.cards[1].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-white mt-2 mb-3">
                {t.reasons.cards[1].title}
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                {t.reasons.cards[1].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-200/70 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Плиты базальтовой ваты' : 'Basalt mineral wool'}</span>
              <span className="font-mono text-[#E6B860]">100 / 150 / 200 мм</span>
            </div>
          </div>

          {/* Card 3: Screw Pile Foundation (Lottie: Pile Driven + Protection Shield) */}
          <div
            onMouseEnter={() => {
              lottieRef3.current?.setSpeed(1.1);
              lottieRef3.current?.seek(0);
              lottieRef3.current?.play();
            }}
            onMouseLeave={() => {
              lottieRef3.current?.setSpeed(0.65);
            }}
            className="glass-card p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#E6B860]/15 border border-[#E6B860]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform overflow-hidden">
                <Lottie
                  lottieRef={lottieRef3}
                  src={pileShieldLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#F5C46B] uppercase">
                {t.reasons.cards[2].tag}
              </span>
              <h3 className="font-display font-semibold text-xl text-neutral-900 dark:text-neutral-100 mt-2 mb-3">
                {t.reasons.cards[2].title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.reasons.cards[2].text}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Монтаж за 1 день' : '1-day installation'}</span>
              <span className="font-mono text-[#B27D18] dark:text-[#F5C46B]">Скидка 50%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
