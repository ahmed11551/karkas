import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { saveLead } from '../utils/leads';
import { playUiClick } from '../utils/sound';

interface HeroProps {
  lang: Language;
  onOpenQuiz: () => void;
  isNightScene: boolean;
  onToggleScene: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onOpenQuiz,
  isNightScene,
  onToggleScene,
}) => {
  const t = TRANSLATIONS[lang];
  const [phoneInput, setPhoneInput] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('7') || val.startsWith('8')) {
      val = val.substring(1);
    }
    val = val.substring(0, 10);

    let formatted = '+7';
    if (val.length > 0) formatted += ` (${val.substring(0, 3)}`;
    if (val.length >= 3) formatted += `) ${val.substring(3, 6)}`;
    if (val.length >= 6) formatted += `-${val.substring(6, 8)}`;
    if (val.length >= 8) formatted += `-${val.substring(8, 10)}`;

    setPhoneInput(formatted);
    if (formError) setFormError('');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = phoneInput.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      setFormError(t.hero.quickCallError);
      return;
    }
    saveLead({
      source: 'hero_quick',
      phone: phoneInput,
      giftsSelected: ['Кровля из металлочерепицы', 'Бесплатная доставка 100 км'],
    });
    playUiClick('success');
    setFormSubmitted(true);
    setFormError('');
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-[#142E25] via-[#10241D] to-[#0A1813] text-white">
      {/* Background ambient architectural grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#E6B860_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      {/* Floating subtle ambient glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-[#E6B860]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#2F5A4B]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & Interactive Controls */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Ambient Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#E6B860] font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hero.monthlyGift}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.12] tracking-tight text-white max-w-2xl text-balance">
              {t.hero.titlePre}
              <span className="text-[#E6B860] underline decoration-[#E6B860]/40 decoration-wavy underline-offset-8">
                {t.hero.titleHighlight}
              </span>
              {t.hero.titlePost}
            </h1>

            {/* Lead Description */}
            <p className="mt-6 text-base sm:text-lg text-emerald-100/85 leading-relaxed max-w-xl">
              {t.hero.lead}
            </p>

            {/* Feature Unboxed Metadata Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-emerald-200/80 my-7">
              {t.hero.chips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E6B860] shrink-0" />
                  <span>{chip}</span>
                  {idx < t.hero.chips.length - 1 && (
                    <span className="text-white/30 hidden sm:inline" aria-hidden="true">
                      ·
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Consultation Form or Success Card */}
            <div className="w-full max-w-lg mt-2">
              {formSubmitted ? (
                <div className="p-4 rounded-2xl bg-white/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3 text-emerald-300">
                  <ShieldCheck className="w-6 h-6 text-[#E6B860] shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-white">{t.hero.quickCallSuccess}</p>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      {lang === 'ru'
                        ? 'Мы закрепили за вами подарки по акции.'
                        : 'Your promotional gifts are reserved.'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      placeholder={t.hero.quickCallPlaceholder}
                      className="flex-1 px-5 py-3.5 rounded-full bg-white text-neutral-900 placeholder-neutral-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-[#E6B860] transition-shadow shadow-md"
                      aria-label="Номер телефона для звонка"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-semibold text-sm transition-all gold-glow whitespace-nowrap active:scale-95"
                    >
                      {t.hero.quickCallBtn}
                    </button>
                  </div>
                  {formError && (
                    <p className="text-xs text-rose-300 px-3 font-medium">{formError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Secondary Actions: Quiz Trigger & Day/Night Scene Toggle */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-white/10 w-full max-w-lg">
              <button
                onClick={onOpenQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all group"
              >
                <span>{t.hero.quizBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#E6B860] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onToggleScene}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-emerald-100 transition-colors"
                title="Переключить атмосферное освещение сцены"
              >
                {isNightScene ? (
                  <>
                    <Sun className="w-4 h-4 text-[#E6B860]" />
                    <span>{t.hero.toggleDay}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#E6B860]" />
                    <span>{t.hero.toggleNight}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Layered Interactive Architectural Scene */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div
              className={`relative w-full max-w-[420px] aspect-[1/1.06] rounded-[2.5rem] rounded-tl-[10rem] overflow-hidden border border-white/20 shadow-2xl transition-all duration-700 ${
                isNightScene
                  ? 'bg-gradient-to-b from-[#091522] via-[#152E38] to-[#11241C]'
                  : 'bg-gradient-to-b from-[#D2E7ED] via-[#EDF5F0] 60% to-[#7CAE8F]'
              }`}
            >
              <svg
                viewBox="0 0 400 420"
                preserveAspectRatio="xMidYMax slice"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                {/* Celestial Body: Sun or Moon */}
                <circle
                  cx="318"
                  cy="96"
                  r="34"
                  fill={isNightScene ? '#EBF0F5' : '#F0B44C'}
                  className="transition-colors duration-700"
                  style={{
                    filter: isNightScene
                      ? 'drop-shadow(0 0 16px rgba(235, 240, 245, 0.7))'
                      : 'drop-shadow(0 0 24px rgba(240, 180, 76, 0.8))',
                  }}
                />

                {/* Night Stars */}
                {isNightScene && (
                  <g fill="#FFFFFF" opacity="0.9" className="transition-opacity duration-700">
                    <circle cx="60" cy="50" r="2" />
                    <circle cx="140" cy="90" r="1.5" />
                    <circle cx="220" cy="40" r="2" />
                    <circle cx="270" cy="150" r="1.5" />
                    <circle cx="90" cy="160" r="1.5" />
                    <circle cx="180" cy="20" r="1.5" />
                    <circle cx="45" cy="110" r="1" />
                    <circle cx="115" cy="45" r="1.5" />
                  </g>
                )}

                {/* Layered Gentle Hills */}
                <path
                  d="M0 262 Q 70 228 140 254 T 290 242 T 400 256 V 420 H 0 Z"
                  fill={isNightScene ? '#1C3A2E' : '#98C2A3'}
                  className="transition-colors duration-700"
                />
                <path
                  d="M0 290 Q 90 270 180 290 T 360 280 T 400 295 V 420 H 0 Z"
                  fill={isNightScene ? '#142B22' : '#77A785'}
                  className="transition-colors duration-700"
                />

                {/* Architectural Frame House */}
                <g transform="translate(50, 120)">
                  {/* Gable Roof */}
                  <path
                    d="M0 150 L 150 6 L 300 150 Z"
                    fill={isNightScene ? '#183B30' : '#2F5A4B'}
                    className="transition-colors duration-700"
                  />
                  <path
                    d="M0 150 L 150 6 L 154 8 L 8 152 Z"
                    fill={isNightScene ? '#0F261E' : '#214237'}
                  />

                  {/* Wall Enclosure */}
                  <rect
                    x="22"
                    y="150"
                    width="256"
                    height="142"
                    fill={isNightScene ? '#D4B889' : '#F6E3C0'}
                    className="transition-colors duration-700"
                  />

                  {/* Vertical Framing Stud Lines */}
                  <g stroke="#C99A52" strokeWidth="2.5" opacity="0.65">
                    <line x1="64" y1="150" x2="64" y2="292" />
                    <line x1="106" y1="150" x2="106" y2="292" />
                    <line x1="148" y1="150" x2="148" y2="292" />
                    <line x1="190" y1="150" x2="190" y2="292" />
                    <line x1="232" y1="150" x2="232" y2="292" />
                  </g>

                  {/* Main Window */}
                  <rect
                    x="60"
                    y="190"
                    width="62"
                    height="64"
                    rx="4"
                    fill={isNightScene ? '#FFD37A' : '#A9CFD8'}
                    stroke={isNightScene ? '#183B30' : '#2F5A4B'}
                    strokeWidth="5"
                    style={{
                      filter: isNightScene
                        ? 'drop-shadow(0 0 14px rgba(255, 211, 122, 0.9))'
                        : 'none',
                    }}
                    className="transition-all duration-500"
                  />
                  <path
                    d="M91 190 V 254 M 60 222 H 122"
                    stroke={isNightScene ? '#183B30' : '#2F5A4B'}
                    strokeWidth="3"
                  />

                  {/* Entrance Door */}
                  <rect
                    x="182"
                    y="188"
                    width="56"
                    height="104"
                    rx="4"
                    fill={isNightScene ? '#183B30' : '#2F5A4B'}
                    className="transition-colors duration-700"
                  />
                  <circle cx="226" cy="242" r="3.5" fill="#F0B44C" />

                  {/* Attic Circle Window */}
                  <rect
                    x="130"
                    y="82"
                    width="40"
                    height="40"
                    rx="20"
                    fill={isNightScene ? '#FFD37A' : '#A9CFD8'}
                    stroke={isNightScene ? '#C5A069' : '#F6E3C0'}
                    strokeWidth="5"
                    style={{
                      filter: isNightScene
                        ? 'drop-shadow(0 0 12px rgba(255, 211, 122, 0.85))'
                        : 'none',
                    }}
                    className="transition-all duration-500"
                  />
                </g>

                {/* Coniferous Forest Trees */}
                <g fill={isNightScene ? '#163328' : '#2F5A4B'} className="transition-colors duration-700">
                  <path d="M20 340 L 42 270 L 64 340 Z" />
                  <path d="M350 350 L 368 292 L 386 350 Z" />
                </g>
              </svg>

              {/* Floating Verified Milestone Badge */}
              <div className="absolute left-5 bottom-5 glass-panel p-3.5 sm:p-4 rounded-2xl shadow-xl text-neutral-900 dark:text-neutral-50 flex items-center gap-3">
                <div className="w-2.5 h-10 rounded-full bg-[#E6B860]" />
                <div>
                  <span className="block font-display font-bold text-xl sm:text-2xl tracking-tight leading-none text-[#142E25] dark:text-[#E6B860]">
                    38 000
                  </span>
                  <span className="text-[12px] sm:text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                    {t.hero.housesBuiltBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
