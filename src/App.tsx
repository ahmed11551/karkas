/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Bell, Lock, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { Language, Theme, HouseItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HouseCatalog } from './components/HouseCatalog';
import { Footer } from './components/Footer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { MessengerFloating } from './components/MessengerFloating';
import { BentoStatsSkeleton } from './components/SkeletonLoaders';
import {
  StoredLead,
  LeadCalculatorParams,
  verifyAdminSession,
  fetchProtectedLeads,
  getCapturedUtmParams,
} from './utils/leads';
import { playUiClick } from './utils/sound';

import { LazyMount, scrollToAnchorWhenReady } from './components/LazyMount';

// Below-the-fold sections: code is split and loaded only when the section nears the viewport
// (see LazyMount). Heavy sections keep their own chunks; the first load stays small.
const BentoStats = lazy(() =>
  import('./components/BentoStats').then((m) => ({ default: m.BentoStats }))
);
const InteractiveCalculator = lazy(() =>
  import('./components/InteractiveCalculator').then((m) => ({ default: m.InteractiveCalculator }))
);
const PackageComparison = lazy(() =>
  import('./components/PackageComparison').then((m) => ({ default: m.PackageComparison }))
);
const MaterialsSection = lazy(() =>
  import('./components/MaterialsSection').then((m) => ({ default: m.MaterialsSection }))
);
const ConstructionMedia = lazy(() =>
  import('./components/ConstructionMedia').then((m) => ({ default: m.ConstructionMedia }))
);
const ProcessTimeline = lazy(() =>
  import('./components/ProcessTimeline').then((m) => ({ default: m.ProcessTimeline }))
);
const InHouseAdvantage = lazy(() =>
  import('./components/InHouseAdvantage').then((m) => ({ default: m.InHouseAdvantage }))
);
const PlotsMap = lazy(() =>
  import('./components/PlotsMap').then((m) => ({ default: m.PlotsMap }))
);
const GiftsBento = lazy(() =>
  import('./components/GiftsBento').then((m) => ({ default: m.GiftsBento }))
);
const FaqSection = lazy(() =>
  import('./components/FaqSection').then((m) => ({ default: m.FaqSection }))
);
const CtaBanner = lazy(() =>
  import('./components/CtaBanner').then((m) => ({ default: m.CtaBanner }))
);

// Lazy-load interactive modals & CRM drawer
const QuizModal = lazy(() =>
  import('./components/QuizModal').then((m) => ({ default: m.QuizModal }))
);
const AdminLoginModal = lazy(() =>
  import('./components/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal }))
);
const AdminLeadsDrawer = lazy(() =>
  import('./components/AdminLeadsDrawer').then((m) => ({ default: m.AdminLeadsDrawer }))
);

const sectionMotionProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15, margin: '0px 0px -30px 0px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  // Start from what public/theme-init.js already applied (saved choice or system), so state matches the DOM.
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [isNightScene, setIsNightScene] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isCrmOpen, setIsCrmOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [realtimeToastLead, setRealtimeToastLead] = useState<StoredLead | null>(null);
  const [selectedLeadIdForCrm, setSelectedLeadIdForCrm] = useState<string | null>(null);

  const [prefilledPrice, setPrefilledPrice] = useState<number | undefined>(undefined);
  const [prefilledCalcParams, setPrefilledCalcParams] = useState<LeadCalculatorParams | undefined>(
    undefined
  );
  const [prefilledHouseTitle, setPrefilledHouseTitle] = useState<string | undefined>(undefined);

  // Scroll progress lives in a ref: it changes every frame, so it must not be React state.
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Dynamic SEO Canonical & OpenGraph URL Resolution
  useEffect(() => {
    const origin = window.location.origin;
    const currentUrl = origin + window.location.pathname;
    const ogImageAbs = `${origin}/og-cover.jpg`;

    const canonicalEl = document.getElementById('canonical-url') as HTMLLinkElement | null;
    if (canonicalEl) canonicalEl.href = currentUrl;

    const ogUrlEl = document.getElementById('og-url') as HTMLMetaElement | null;
    if (ogUrlEl) ogUrlEl.content = currentUrl;

    const ogImgEl = document.getElementById('og-image') as HTMLMetaElement | null;
    if (ogImgEl) ogImgEl.content = ogImageAbs;

    const twImgEl = document.getElementById('twitter-image') as HTMLMetaElement | null;
    if (twImgEl) twImgEl.content = ogImageAbs;

    document.documentElement.lang = lang;
    document.title =
      lang === 'ru'
        ? 'Каркасник — Дачные дома в Москве и МО от 498 000 ₽'
        : 'Karkasnik — Country Frame Houses in Moscow from 498,000 ₽';
  }, [lang]);

  // 1. Initialize Lenis Smooth Scroll ("Эффект Шелка") synced with IntersectionObserver & Scroll Progress
  useEffect(() => {
    // Users who ask for reduced motion get native scrolling (no eased wheel/anchor tweens).
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Touch screens scroll natively (no JS smoothing); mouse and trackpad keep the eased wheel.
    const smooth = !reduceMotion && !window.matchMedia('(pointer: coarse)').matches;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: smooth,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    });

    lenisRef.current = lenis;

    // Runs on each Lenis frame while scrolling. It only writes the progress bar when its value
    // changes (0.1% steps), and React state changes only when the header threshold is crossed.
    let scrolledNow = false;
    let lastProgress = -1;
    lenis.on('scroll', ({ scroll, progress }: { scroll: number; progress: number }) => {
      const clamped = Number.isNaN(progress) ? 0 : Math.min(1, Math.max(0, progress));
      const bar = progressBarRef.current;
      const pct = Math.round(clamped * 1000);
      if (bar && pct !== lastProgress) {
        lastProgress = pct;
        bar.style.transform = `scaleX(${clamped})`;
        bar.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
      }
      const nextScrolled = scroll > 60;
      if (nextScrolled !== scrolledNow) {
        scrolledNow = nextScrolled;
        setIsScrolled(nextScrolled);
      }
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        if (href === '#login') {
          e.preventDefault();
          setIsAdminLoginOpen(true);
          return;
        }
        const sectionEl = document.querySelector(href) as HTMLElement | null;
        if (sectionEl) {
          e.preventDefault();
          // Without smooth scrolling (touch, reduced motion) jump instantly, like a native anchor.
          scrollToAnchorWhenReady(lenis, href, reduceMotion || !smooth);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      gsap.ticker.remove(updateLenis);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  // 2. Verify Admin Session & Support /login URL or Alt+L shortcut
  useEffect(() => {
    getCapturedUtmParams();

    const checkAuth = async () => {
      const valid = await verifyAdminSession();
      setIsAdminAuthenticated(valid);
      if (valid) {
        const res = await fetchProtectedLeads();
        setNewLeadsCount(res.leads.filter((l) => (l.status || 'new') === 'new').length);
      }
    };
    checkAuth();

    if (
      window.location.pathname === '/login' ||
      window.location.hash === '#login' ||
      window.location.search.includes('login=1')
    ) {
      setIsAdminLoginOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };

    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent<{ authenticated: boolean }>;
      setIsAdminAuthenticated(Boolean(custom.detail?.authenticated));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('admin_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('admin_auth_changed', handleAuthChange);
    };
  }, []);

  // 3. Real-Time Lead Notifications (SSE + CustomEvent) for Admin
  useEffect(() => {
    const triggerToastForLead = (lead: StoredLead) => {
      setNewLeadsCount((prev) => prev + 1);
      if (isAdminAuthenticated) {
        playUiClick('success');
        setRealtimeToastLead(lead);
      }
    };

    const handleLocalNewLead = (e: Event) => {
      const custom = e as CustomEvent<StoredLead>;
      if (custom.detail) {
        triggerToastForLead(custom.detail);
      }
    };

    window.addEventListener('crm_new_lead', handleLocalNewLead);

    let eventSource: EventSource | null = null;
    if (isAdminAuthenticated && typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource('/api/leads/stream');
        eventSource.addEventListener('new_lead', (ev: MessageEvent) => {
          try {
            const incomingLead: StoredLead = JSON.parse(ev.data);
            setRealtimeToastLead((current) =>
              current?.id === incomingLead.id ? current : incomingLead
            );
            window.dispatchEvent(new CustomEvent('leads_updated'));
          } catch {
            // ignore parse error
          }
        });
      } catch {
        // ignore SSE error
      }
    }

    return () => {
      window.removeEventListener('crm_new_lead', handleLocalNewLead);
      eventSource?.close();
    };
  }, [isAdminAuthenticated]);

  // Sync dark class on root html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const handleToggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      // Same key as public/theme-init.js. Storage can be blocked; the toggle still works for this visit.
      window.localStorage.setItem('karkas-theme', next);
    } catch {
      // ignore
    }
  };

  const handleToggleScene = () => {
    setIsNightScene((prev) => !prev);
  };

  const handleOpenQuiz = (
    price?: number,
    calcParams?: LeadCalculatorParams,
    houseTitle?: string
  ) => {
    setPrefilledPrice(price);
    setPrefilledCalcParams(calcParams);
    setPrefilledHouseTitle(houseTitle);
    setIsQuizOpen(true);
  };

  const handleSelectHouse = (house: HouseItem) => {
    setPrefilledPrice(house.price * 1000);
    setPrefilledHouseTitle(house.name[lang]);
    setPrefilledCalcParams({
      size: house.area,
      insulation: '150 мм (Осень-Зима)',
      foundation: 'Свайно-винтовой (−50% акция)',
      veranda: house.style === 'glassv' ? 'С панорамной верандой' : 'По проекту',
    });
    setIsQuizOpen(true);
  };

  return (
    <div id="main-content" className="min-h-screen bg-[#F4F2EC] dark:bg-[#0B1512] text-[#14231E] dark:text-[#E8F1EC] transition-colors duration-300 font-sans selection:bg-[#E6B860]/30 selection:text-[#B27D18] relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#14231E]"
      >
        Перейти к содержанию
      </a>
      {/* Global Subtle Film-Grain Texture Overlay */}
      <div
        className="fixed inset-0 bg-grain-overlay pointer-events-none z-40"
        aria-hidden="true"
      />

      {/* Top Reading Progress Bar (Synced with Lenis) */}
      {/* Updated imperatively from the Lenis scroll handler (no React re-render per frame) */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 w-full h-[3px] origin-left bg-[#E6B860] z-50 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
        role="progressbar"
        aria-label={lang === 'ru' ? 'Прогресс чтения страницы' : 'Page reading progress'}
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Real-Time Admin Toast Notification */}
      <AnimatePresence>
        {isAdminAuthenticated && realtimeToastLead && (
          <motion.div
            key={realtimeToastLead.id}
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 right-4 sm:right-6 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-[#122A21]/95 backdrop-blur-xl border border-[#E6B860] text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#E6B860] text-[#1E1705] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E6B860] font-bold block">
                    REAL-TIME LEAD · {realtimeToastLead.id}
                  </span>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                    Новая заявка: {realtimeToastLead.houseTitle || 'Калькулятор'}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setRealtimeToastLead(null)}
                className="text-emerald-200/70 hover:text-white p-1"
                aria-label="Закрыть уведомление"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2.5 text-xs text-emerald-100/90 space-y-1 bg-black/25 p-2.5 rounded-xl border border-white/10">
              <div className="flex justify-between">
                <span className="text-emerald-200/60">Сумма сметы:</span>
                <span className="font-mono font-bold text-[#E6B860]">
                  ≈ {(realtimeToastLead.calculatedPrice || 707000).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              {realtimeToastLead.calculatorParams && (
                <div className="flex justify-between">
                  <span className="text-emerald-200/60">Конфигурация:</span>
                  <span className="font-mono text-[11px]">
                    {realtimeToastLead.calculatorParams.size} м² ·{' '}
                    {realtimeToastLead.calculatorParams.insulation}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-emerald-200/60">Контакт:</span>
                <span className="font-mono text-[11px]">{realtimeToastLead.phone}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = realtimeToastLead.id;
                  setRealtimeToastLead(null);
                  setSelectedLeadIdForCrm(id);
                  setIsCrmOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Открыть карточку лида в CRM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Frosted Top Navigation Bar (CRM Button mounted in DOM ONLY if isAdminAuthenticated is true) */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenQuiz={() => handleOpenQuiz()}
        onOpenCrm={() => {
          setSelectedLeadIdForCrm(null);
          setIsCrmOpen(true);
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        newLeadsCount={newLeadsCount}
        isScrolled={isScrolled}
      />

      {/* Hero Section with Parallax SVG Architectural Scene */}
      <Hero
        lang={lang}
        onOpenQuiz={() => handleOpenQuiz()}
        isNightScene={isNightScene}
        onToggleScene={handleToggleScene}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {/* Bento Grid Proof Metrics & 3 Reason Cards with Lottie Animations */}
        <LazyMount minHeight="360px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <Suspense fallback={<BentoStatsSkeleton />}>
              <BentoStats lang={lang} />
            </Suspense>
          </motion.div>
        </LazyMount>

        {/* Interactive Architectural Catalog (Bento Grid + WebP Renders + Cross-Fade) */}
        <motion.div {...sectionMotionProps}>
          <HouseCatalog
            lang={lang}
            onSelectHouse={handleSelectHouse}
            isNightScene={isNightScene}
          />
        </motion.div>

        <LazyMount anchorId="calculator" minHeight="900px">
          <motion.div {...sectionMotionProps}>
            <InteractiveCalculator
              lang={lang}
              onOpenQuiz={handleOpenQuiz}
              isNightScene={isNightScene}
            />
          </motion.div>
        </LazyMount>

        <LazyMount minHeight="700px">
          <motion.div {...sectionMotionProps}>
            <PackageComparison
              lang={lang}
              onSelectPackage={(price) => handleOpenQuiz(price)}
            />
          </motion.div>
        </LazyMount>

        <LazyMount anchorId="materials" minHeight="900px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <MaterialsSection lang={lang} />
          </motion.div>
        </LazyMount>

        <LazyMount minHeight="800px">
          <motion.div {...sectionMotionProps}>
            <ConstructionMedia
              lang={lang}
              onOpenQuiz={() => handleOpenQuiz()}
            />
          </motion.div>
        </LazyMount>

        <LazyMount anchorId="steps" minHeight="800px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <ProcessTimeline lang={lang} />
          </motion.div>
        </LazyMount>

        <LazyMount minHeight="600px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <InHouseAdvantage lang={lang} />
          </motion.div>
        </LazyMount>

        <LazyMount minHeight="800px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <PlotsMap lang={lang} />
          </motion.div>
        </LazyMount>

        <LazyMount anchorId="gifts" minHeight="700px">
          <motion.div {...sectionMotionProps}>
            <GiftsBento
              lang={lang}
              onOpenQuiz={() => handleOpenQuiz()}
            />
          </motion.div>
        </LazyMount>

        <LazyMount anchorId="faq" minHeight="700px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <FaqSection lang={lang} />
          </motion.div>
        </LazyMount>

        <LazyMount minHeight="360px">
          <motion.div className="cv-auto" {...sectionMotionProps}>
            <CtaBanner
              lang={lang}
              onOpenQuiz={() => handleOpenQuiz()}
            />
          </motion.div>
        </LazyMount>
      </motion.div>

      {/* Footer Credentials, Policy Links & /login Staff Trigger */}
      <Footer
        lang={lang}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenCrm={() => setIsCrmOpen(true)}
      />

      {/* Bottom-Left Quick Utility Dock: /login Staff Access */}
      <div className="fixed bottom-3 left-4 z-40 hidden xl:flex items-center gap-2">
        {!isAdminAuthenticated ? (
          <button
            onClick={() => {
              playUiClick('tap');
              setIsAdminLoginOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-[#183B30]/90 text-[#E6B860] border border-[#E6B860]/40 text-[11px] font-mono hover:scale-105 transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 opacity-80 hover:opacity-100"
            title="Авторизация администратора (/login)"
          >
            <Lock className="w-3 h-3" />
            <span>/login (CRM)</span>
          </button>
        ) : (
          <button
            onClick={() => {
              playUiClick('tap');
              setIsCrmOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-[#E6B860] text-[#1E1705] font-semibold text-[11px] font-mono hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRM Активна ({newLeadsCount})</span>
          </button>
        )}
      </div>

      {/* Mobile Sticky Quick Action Bar */}
      <StickyMobileBar
        lang={lang}
        onOpenQuiz={() => handleOpenQuiz()}
        isVisible={isScrolled}
      />

      {/* Direct Telegram & WhatsApp Messenger Quick-Conversion Floating Widget */}
      <MessengerFloating lang={lang} showOnMobile={isScrolled} />

      {/* Lazy-Loaded Interactive Modals & CRM Drawer */}
      <Suspense fallback={null}>
        {isQuizOpen && (
          <QuizModal
            isOpen={isQuizOpen}
            onClose={() => setIsQuizOpen(false)}
            lang={lang}
            prefilledPrice={prefilledPrice}
            prefilledCalcParams={prefilledCalcParams}
            prefilledHouseTitle={prefilledHouseTitle}
          />
        )}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onSuccess={async () => {
              setIsAdminAuthenticated(true);
              const res = await fetchProtectedLeads();
              setNewLeadsCount(res.leads.filter((l) => (l.status || 'new') === 'new').length);
              setIsCrmOpen(true);
            }}
          />
        )}

        {isAdminAuthenticated && isCrmOpen && (
          <AdminLeadsDrawer
            isOpen={isCrmOpen}
            onClose={() => setIsCrmOpen(false)}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              setRealtimeToastLead(null);
            }}
            initialSelectedLeadId={selectedLeadIdForCrm}
          />
        )}
      </Suspense>
    </div>
  );
}
