import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Sun, Moon, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { buildMessengerUrl } from '../config/company';
import { saveLead } from '../utils/leads';
import { playUiClick } from '../utils/sound';
import { formatRussianPhoneInput, validateRussianPhone } from '../utils/phoneValidation';

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

  // Refs for 60fps GSAP Mouse-Parallax Layers
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const sceneCardRef = useRef<HTMLDivElement | null>(null);
  const sunRef = useRef<SVGCircleElement | null>(null);
  const cloudsRef = useRef<SVGGElement | null>(null);
  const starsRef = useRef<SVGGElement | null>(null);
  const farHillRef = useRef<SVGPathElement | null>(null);
  const nearHillRef = useRef<SVGPathElement | null>(null);
  const houseRef = useRef<SVGGElement | null>(null);
  const treesRef = useRef<SVGGElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    // Skip expensive parallax recalculations on mobile touch screens for <2s 4G responsiveness
    if (!heroSectionRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = heroSectionRef.current.getBoundingClientRect();
    // Normalized coordinates from -1 to +1
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // 3D Frame Tilt
    if (sceneCardRef.current) {
      gsap.to(sceneCardRef.current, {
        rotateY: nx * 5,
        rotateX: -ny * 4,
        transformPerspective: 1000,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Sun / Moon moves opposite to cursor
    if (sunRef.current) {
      gsap.to(sunRef.current, {
        x: -nx * 24,
        y: -ny * 16,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Clouds drift in opposite direction
    if (cloudsRef.current) {
      gsap.to(cloudsRef.current, {
        x: -nx * 34,
        y: -ny * 12,
        duration: 0.85,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Night stars subtle opposite parallax
    if (starsRef.current) {
      gsap.to(starsRef.current, {
        x: -nx * 12,
        y: -ny * 9,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Far hill layer (moves slightly opposite)
    if (farHillRef.current) {
      gsap.to(farHillRef.current, {
        x: -nx * 9,
        y: -ny * 4,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Near hill layer (moves with cursor)
    if (nearHillRef.current) {
      gsap.to(nearHillRef.current, {
        x: nx * 8,
        y: ny * 4,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Main House moves in foreground direction (opposite to Sun & Clouds for 3D depth)
    if (houseRef.current) {
      gsap.to(houseRef.current, {
        x: nx * 16,
        y: ny * 9,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Foreground trees move faster for deep parallax separation
    if (treesRef.current) {
      gsap.to(treesRef.current, {
        x: nx * 26,
        y: ny * 12,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Floating milestone badge
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        x: nx * 12,
        y: ny * 7,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (sceneCardRef.current)
      gsap.to(sceneCardRef.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' });
    if (sunRef.current) gsap.to(sunRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (cloudsRef.current) gsap.to(cloudsRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (starsRef.current) gsap.to(starsRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (farHillRef.current) gsap.to(farHillRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (nearHillRef.current) gsap.to(nearHillRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (houseRef.current) gsap.to(houseRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (treesRef.current) gsap.to(treesRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    if (badgeRef.current) gsap.to(badgeRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRussianPhoneInput(e.target.value);
    setPhoneInput(formatted);
    if (formError) setFormError('');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRussianPhone(phoneInput, lang);
    if (!validation.isValid) {
      playUiClick('tick');
      setFormError(validation.error || t.hero.quickCallError);
      return;
    }
    saveLead({
      source: 'hero_quick',
      phone: validation.normalized || phoneInput,
      giftsSelected: ['Кровля из металлочерепицы', 'Бесплатная доставка 100 км'],
    });
    playUiClick('success');
    setFormSubmitted(true);
    setFormError('');
  };

  return (
    <section
      ref={heroSectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-[#142E25] via-[#10241D] to-[#0A1813] text-white"
    >
      {/* Awwwards-Style Film Grain Noise Texture Overlay */}
      <div className="absolute inset-0 bg-grain-overlay pointer-events-none z-[1]" />

      {/* Background ambient architectural grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#E6B860_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      {/* Floating subtle ambient glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-[#E6B860]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#2F5A4B]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="p-4 rounded-2xl bg-white/10 border border-emerald-500/30 backdrop-blur-md space-y-3 text-emerald-300">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#E6B860] shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-white">{t.hero.quickCallSuccess}</p>
                      <p className="text-xs text-emerald-200/80 mt-0.5">
                        {lang === 'ru'
                          ? 'Мы закрепили за вами подарки по акции. Можете сразу написать инженеру:'
                          : 'Your promotional gifts are reserved. Message our engineer directly:'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={buildMessengerUrl(
                        'whatsapp',
                        `Здравствуйте! Оставил заявку на сайте (${phoneInput}). Хочу получить расчёт дома и закрепить подарки по акции.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Написать в WhatsApp</span>
                    </a>
                    <a
                      href={buildMessengerUrl(
                        'telegram',
                        `Здравствуйте! Оставил заявку на сайте (${phoneInput}). Хочу получить расчёт дома.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1C88BD] text-white text-xs font-semibold transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Написать в Telegram</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} noValidate className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={18}
                      required
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      placeholder={t.hero.quickCallPlaceholder}
                      aria-invalid={Boolean(formError)}
                      className={`flex-1 px-5 py-3.5 rounded-full bg-white text-neutral-900 placeholder-neutral-400 font-medium text-base focus:outline-none focus:ring-2 transition-shadow shadow-md ${
                        formError
                          ? 'ring-2 ring-rose-400 bg-rose-50'
                          : 'focus:ring-[#E6B860]'
                      }`}
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
                    <p
                      role="alert"
                      className="text-xs text-rose-300 px-3 font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{formError}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Secondary Actions: Quiz Trigger & Day/Night Scene Toggle */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-white/10 w-full max-w-lg">
              <button
                onClick={() => {
                  playUiClick('tap');
                  onOpenQuiz();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all group"
              >
                <span>{t.hero.quizBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#E6B860] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  playUiClick('tap');
                  onToggleScene();
                }}
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

          {/* Right Column: Layered Interactive Mouse-Parallax Architectural Scene */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div
              ref={sceneCardRef}
              style={{ transformStyle: 'preserve-3d' }}
              className={`relative w-full max-w-[420px] aspect-[1/1.06] rounded-[2.5rem] rounded-tl-[10rem] overflow-hidden border border-white/20 shadow-2xl transition-colors duration-700 will-change-transform ${
                isNightScene
                  ? 'bg-gradient-to-b from-[#091522] via-[#152E38] to-[#11241C]'
                  : 'bg-gradient-to-b from-[#D2E7ED] via-[#EDF5F0] 60% to-[#7CAE8F]'
              }`}
            >
              {/* Subtle Grain Overlay inside the scene */}
              <div className="absolute inset-0 bg-grain-overlay pointer-events-none z-20" />

              <svg
                viewBox="-20 -10 440 430"
                preserveAspectRatio="xMidYMax slice"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                {/* Celestial Body: Sun or Moon (Parallax Layer 1) */}
                <circle
                  ref={sunRef}
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

                {/* Night Stars (Parallax Layer 2) */}
                <g
                  ref={starsRef}
                  fill="#FFFFFF"
                  opacity={isNightScene ? 0.9 : 0}
                  className="transition-opacity duration-700"
                >
                  <circle cx="60" cy="50" r="2" />
                  <circle cx="140" cy="90" r="1.5" />
                  <circle cx="220" cy="40" r="2" />
                  <circle cx="270" cy="150" r="1.5" />
                  <circle cx="90" cy="160" r="1.5" />
                  <circle cx="180" cy="20" r="1.5" />
                  <circle cx="45" cy="110" r="1" />
                  <circle cx="115" cy="45" r="1.5" />
                </g>

                {/* Layered Atmospheric Clouds (Parallax Layer 3 — moves opposite to cursor) */}
                <g
                  ref={cloudsRef}
                  fill={isNightScene ? '#334E68' : '#FFFFFF'}
                  opacity={isNightScene ? 0.35 : 0.75}
                  className="transition-all duration-700"
                >
                  {/* Left High Cloud */}
                  <g transform="translate(38, 66)">
                    <rect x="0" y="10" width="68" height="16" rx="8" />
                    <circle cx="22" cy="12" r="12" />
                    <circle cx="42" cy="9" r="15" />
                  </g>
                  {/* Right Mid Cloud */}
                  <g transform="translate(215, 118)">
                    <rect x="0" y="8" width="54" height="13" rx="6.5" />
                    <circle cx="18" cy="10" r="10" />
                    <circle cx="34" cy="8" r="12" />
                  </g>
                </g>

                {/* Far & Near Gentle Hills (Parallax Layers 4 & 5) */}
                <path
                  ref={farHillRef}
                  d="M-40 262 Q 70 228 140 254 T 290 242 T 440 256 V 430 H -40 Z"
                  fill={isNightScene ? '#1C3A2E' : '#98C2A3'}
                  className="transition-colors duration-700"
                />
                <path
                  ref={nearHillRef}
                  d="M-40 290 Q 90 270 180 290 T 360 280 T 440 295 V 430 H -40 Z"
                  fill={isNightScene ? '#142B22' : '#77A785'}
                  className="transition-colors duration-700"
                />

                {/* Architectural Frame House (Parallax Layer 6 — moves opposite to Sun & Clouds) */}
                <g ref={houseRef}>
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
                </g>

                {/* Coniferous Forest Trees (Foreground Parallax Layer 7) */}
                <g
                  ref={treesRef}
                  fill={isNightScene ? '#163328' : '#2F5A4B'}
                  className="transition-colors duration-700"
                >
                  <path d="M16 344 L 40 268 L 64 344 Z" />
                  <path d="M348 352 L 368 288 L 388 352 Z" />
                </g>
              </svg>

              {/* Floating Verified Milestone Badge */}
              <div
                ref={badgeRef}
                className="absolute left-5 bottom-5 z-30 glass-panel p-3.5 sm:p-4 rounded-2xl shadow-xl text-neutral-900 dark:text-neutral-50 flex items-center gap-3"
              >
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
