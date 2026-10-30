/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Bell, Lock, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { Language, Theme, HouseItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoStats } from './components/BentoStats';
import { HouseCatalog } from './components/HouseCatalog';
import { Footer } from './components/Footer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { MessengerFloating } from './components/MessengerFloating';
import {
  BentoStatsSkeleton,
  CatalogSkeleton,
  CalculatorSkeleton,
  PlotsMapSkeleton,
} from './components/SkeletonLoaders';
import {
  StoredLead,
  LeadCalculatorParams,
  verifyAdminSession,
  getAdminToken,
  fetchProtectedLeads,
  getCapturedUtmParams,
} from './utils/leads';
import { playUiClick } from './utils/sound';

import { InteractiveCalculator } from './components/InteractiveCalculator';
import { PackageComparison } from './components/PackageComparison';
import { MaterialsSection } from './components/MaterialsSection';
import { ConstructionMedia } from './components/ConstructionMedia';
import { ProcessTimeline } from './components/ProcessTimeline';
import { InHouseAdvantage } from './components/InHouseAdvantage';
import { PlotsMap } from './components/PlotsMap';
import { GiftsBento } from './components/GiftsBento';
import { FaqSection } from './components/FaqSection';
import { CtaBanner } from './components/CtaBanner';

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
  viewport: { once: true, amount: 0.02, margin: '0px 0px -30px 0px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [theme, setTheme] = useState<Theme>('light');
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

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isDataFetching, setIsDataFetching] = useState<boolean>(false);

  const lenisRef = useRef<Lenis | null>(null);

  const handleSimulateDataFetch = () => {
    setIsDataFetching(true);
    setTimeout(() => {
      setIsDataFetching(false);
    }, 850);
  };

  // Dynamic SEO Canonical & OpenGraph URL Resolution
  useEffect(() => {
    const origin = window.location.origin;
    const currentUrl = origin + window.location.pathname;
    const ogImageAbs = `${origin}/og-cover.webp`;

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
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ({ scroll, progress }: { scroll: number; progress: number }) => {
      setScrollProgress(Number.isNaN(progress) ? 0 : progress * 100);
      setIsScrolled(scroll > 60);
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
          lenis.scrollTo(sectionEl, { offset: -80, duration: 1.2 });
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
    const token = getAdminToken();
    if (isAdminAuthenticated && token && typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource(`/api/leads/stream?token=${encodeURIComponent(token)}`);
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
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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
    <div className="min-h-screen bg-[#F4F2EC] dark:bg-[#0B1512] text-[#14231E] dark:text-[#E8F1EC] transition-colors duration-300 font-sans selection:bg-[#E6B860]/30 selection:text-[#B27D18] relative">
      {/* Global Subtle Film-Grain Texture Overlay */}
      <div
        className="fixed inset-0 bg-grain-overlay pointer-events-none z-40"
        aria-hidden="true"
      />

      {/* Top Reading Progress Bar (Synced with Lenis) */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[#E6B860] z-50 transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
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

      {/* Interactive Perceived Data Fetching Skeleton Switcher */}
      <AnimatePresence mode="wait">
        {isDataFetching ? (
          <motion.div
            key="skeleton-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            <BentoStatsSkeleton />
            <CatalogSkeleton />
            <CalculatorSkeleton />
            <PlotsMapSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="loaded-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {/* Bento Grid Proof Metrics & 3 Reason Cards with Lottie Animations */}
            <motion.div {...sectionMotionProps}>
              <BentoStats lang={lang} />
            </motion.div>

            {/* Interactive Architectural Catalog (Bento Grid + WebP Renders + Cross-Fade) */}
            <motion.div {...sectionMotionProps}>
              <HouseCatalog
                lang={lang}
                onSelectHouse={handleSelectHouse}
                isNightScene={isNightScene}
              />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <InteractiveCalculator
                lang={lang}
                onOpenQuiz={handleOpenQuiz}
                isNightScene={isNightScene}
              />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <PackageComparison
                lang={lang}
                onSelectPackage={(price) => handleOpenQuiz(price)}
              />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <MaterialsSection lang={lang} />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <ConstructionMedia
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <ProcessTimeline lang={lang} />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <InHouseAdvantage lang={lang} />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <PlotsMap lang={lang} />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <GiftsBento
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <FaqSection lang={lang} />
            </motion.div>

            <motion.div {...sectionMotionProps}>
              <CtaBanner
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Credentials, Policy Links & /login Staff Trigger */}
      <Footer
        lang={lang}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenCrm={() => setIsCrmOpen(true)}
      />

      {/* Bottom-Left Quick Utility Dock: Skeleton Trigger + /login Staff Access */}
      <div className="fixed bottom-3 left-4 z-40 hidden sm:flex items-center gap-2">
        <button
          onClick={handleSimulateDataFetch}
          className="px-3 py-1.5 rounded-full bg-neutral-900/80 dark:bg-neutral-100/90 text-white dark:text-neutral-900 text-[11px] font-mono hover:scale-105 transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 opacity-75 hover:opacity-100"
          title="Показать скелетон-загрузку Framer Motion"
        >
          <span className="w-2 h-2 rounded-full bg-[#E6B860] animate-pulse" />
          <span>Скелетон</span>
        </button>

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
      <MessengerFloating />

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
