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

  const kpis = [
    { value: t.stats.builtCount, label: t.stats.builtLabel },
    { value: t.stats.projectsCount, label: t.stats.projectsLabel },
    { value: t.stats.assemblyCount, label: t.stats.assemblyLabel },
    { value: t.stats.warrantyCount, label: t.stats.warrantyLabel },
  ];

  return (
    <section
      ref={sectionRef}
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
            <span className="block font-serif text-4xl sm:text-5xl lg:text-6xl leading-none tracking-[-0.02em] text-ink dark:text-cream tabular-nums">
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
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
            {t.reasons.title}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-sm md:text-right leading-relaxed">
          {t.reasons.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
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
          className="group flex flex-col justify-between p-7 sm:p-8 rounded-2xl border border-ink/12 dark:border-cream/10 bg-paper dark:bg-forest-raised transition-transform duration-500 ease-out-soft hover:-translate-y-1"
        >
          <div>
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-full border border-ink/15 dark:border-cream/15 flex items-center justify-center overflow-hidden">
                <Lottie
                  lottieRef={lottieRef1}
                  src={blueprintHouseLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="font-serif italic text-2xl text-olive dark:text-cream-soft">01</span>
            </div>
            <span className="eyebrow text-brass-ink dark:text-brass-light">
              {t.reasons.cards[0].tag}
            </span>
            <h3 className="font-serif text-3xl leading-tight text-ink dark:text-cream mt-3 mb-3">
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
        <div
          onMouseEnter={() => {
            lottieRef2.current?.setSpeed(1.1);
            lottieRef2.current?.seek(0);
            lottieRef2.current?.play();
          }}
          onMouseLeave={() => {
            lottieRef2.current?.setSpeed(0.55);
          }}
          className="group flex flex-col justify-between p-7 sm:p-8 rounded-2xl border border-cream/10 bg-forest text-cream dark:bg-forest-raised transition-transform duration-500 ease-out-soft hover:-translate-y-1"
        >
          <div>
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-full border border-cream/20 flex items-center justify-center overflow-hidden">
                <Lottie
                  lottieRef={lottieRef2}
                  src={seasonalHouseLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="font-serif italic text-2xl text-cream-soft">02</span>
            </div>
            <span className="eyebrow text-brass-light">{t.reasons.cards[1].tag}</span>
            <h3 className="font-serif text-3xl leading-tight text-cream mt-3 mb-3">
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
        <div
          onMouseEnter={() => {
            lottieRef3.current?.setSpeed(1.1);
            lottieRef3.current?.seek(0);
            lottieRef3.current?.play();
          }}
          onMouseLeave={() => {
            lottieRef3.current?.setSpeed(0.65);
          }}
          className="group flex flex-col justify-between p-7 sm:p-8 rounded-2xl border border-ink/12 dark:border-cream/10 bg-paper dark:bg-forest-raised transition-transform duration-500 ease-out-soft hover:-translate-y-1"
        >
          <div>
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-full border border-ink/15 dark:border-cream/15 flex items-center justify-center overflow-hidden">
                <Lottie
                  lottieRef={lottieRef3}
                  src={pileShieldLottie}
                  loop={true}
                  autoplay={inView}
                  className="w-14 h-14"
                />
              </div>
              <span className="font-serif italic text-2xl text-olive dark:text-cream-soft">03</span>
            </div>
            <span className="eyebrow text-brass-ink dark:text-brass-light">
              {t.reasons.cards[2].tag}
            </span>
            <h3 className="font-serif text-3xl leading-tight text-ink dark:text-cream mt-3 mb-3">
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
