/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Theme, HouseItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoStats } from './components/BentoStats';
import { HouseCatalog } from './components/HouseCatalog';
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
import { Footer } from './components/Footer';
import { QuizModal } from './components/QuizModal';
import { StickyMobileBar } from './components/StickyMobileBar';
import { AdminLeadsDrawer } from './components/AdminLeadsDrawer';
import { MessengerFloating } from './components/MessengerFloating';
import {
  BentoStatsSkeleton,
  CatalogSkeleton,
  CalculatorSkeleton,
  PlotsMapSkeleton,
} from './components/SkeletonLoaders';

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
  const [prefilledPrice, setPrefilledPrice] = useState<number | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Instant zero-latency rendering by default; skeleton mode available on demand
  const [isDataFetching, setIsDataFetching] = useState<boolean>(false);

  const handleSimulateDataFetch = () => {
    setIsDataFetching(true);
    setTimeout(() => {
      setIsDataFetching(false);
    }, 850);
  };

  // Sync dark class on root html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Track scroll progress and header state
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(Number.isNaN(scroll) ? 0 : scroll * 100);
      setIsScrolled(totalScroll > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleScene = () => {
    setIsNightScene((prev) => !prev);
  };

  const handleOpenQuiz = (price?: number) => {
    setPrefilledPrice(price);
    setIsQuizOpen(true);
  };

  const handleSelectHouse = (house: HouseItem) => {
    setPrefilledPrice(house.price * 1000);
    setIsQuizOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] dark:bg-[#0B1512] text-[#14231E] dark:text-[#E8F1EC] transition-colors duration-300 font-sans selection:bg-[#E6B860]/30 selection:text-[#B27D18]">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[#E6B860] z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Main Frosted Top Navigation Bar */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenQuiz={() => handleOpenQuiz()}
        onOpenCrm={() => setIsCrmOpen(true)}
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
            {/* Bento Grid Proof Metrics & 3 Reason Cards */}
            <motion.div {...sectionMotionProps}>
              <BentoStats lang={lang} />
            </motion.div>

            {/* Interactive Architectural Catalog (Top-6 with Show All 15 toggle) */}
            <motion.div {...sectionMotionProps}>
              <HouseCatalog
                lang={lang}
                onSelectHouse={handleSelectHouse}
                isNightScene={isNightScene}
              />
            </motion.div>

            {/* Real-time Interactive Calculator with Rolling Numbers, PDF Estimate & Mortgage Mode */}
            <motion.div {...sectionMotionProps}>
              <InteractiveCalculator
                lang={lang}
                onOpenQuiz={handleOpenQuiz}
                isNightScene={isNightScene}
              />
            </motion.div>

            {/* Interactive Package Comparison Matrix: Summer 100mm vs All-Season 150mm vs Arctic 200mm */}
            <motion.div {...sectionMotionProps}>
              <PackageComparison
                lang={lang}
                onSelectPackage={(price) => handleOpenQuiz(price)}
              />
            </motion.div>

            {/* Interactive 3D Isometric Wall Structure Cutaway with 6 Hotspots */}
            <motion.div {...sectionMotionProps}>
              <MaterialsSection lang={lang} />
            </motion.div>

            {/* Live Construction Video Timelapse & 3-Day Site Reportage */}
            <motion.div {...sectionMotionProps}>
              <ConstructionMedia
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>

            {/* 6-Step Construction Journey Timeline */}
            <motion.div {...sectionMotionProps}>
              <ProcessTimeline lang={lang} />
            </motion.div>

            {/* In-House Production & Logistics Infrastructure Bento */}
            <motion.div {...sectionMotionProps}>
              <InHouseAdvantage lang={lang} />
            </motion.div>

            {/* Interactive Geolocation Map of Completed Houses in Moscow Region */}
            <motion.div {...sectionMotionProps}>
              <PlotsMap lang={lang} />
            </motion.div>

            {/* 4 Seasonal Gifts Presentation */}
            <motion.div {...sectionMotionProps}>
              <GiftsBento
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div {...sectionMotionProps}>
              <FaqSection lang={lang} />
            </motion.div>

            {/* Conversion Banner CTA */}
            <motion.div {...sectionMotionProps}>
              <CtaBanner
                lang={lang}
                onOpenQuiz={() => handleOpenQuiz()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Credentials & Policy Links */}
      <Footer lang={lang} />

      {/* Skeleton Trigger Button in Bottom Corner for instant demonstration */}
      <div className="fixed bottom-3 left-4 z-40 hidden sm:block">
        <button
          onClick={handleSimulateDataFetch}
          className="px-3 py-1.5 rounded-full bg-neutral-900/80 dark:bg-neutral-100/90 text-white dark:text-neutral-900 text-[11px] font-mono hover:scale-105 transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 opacity-75 hover:opacity-100"
          title="Показать скелетон-загрузку Framer Motion"
        >
          <span className="w-2 h-2 rounded-full bg-[#E6B860] animate-pulse" />
          <span>Скелетон-загрузка</span>
        </button>
      </div>

      {/* Mobile Sticky Quick Action Bar */}
      <StickyMobileBar
        lang={lang}
        onOpenQuiz={() => handleOpenQuiz()}
        isVisible={isScrolled}
      />

      {/* Direct Telegram & WhatsApp Messenger Quick-Conversion Floating Widget */}
      <MessengerFloating />

      {/* Interactive 5-Step Consultation & Bonus Gift Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lang={lang}
        prefilledPrice={prefilledPrice}
      />

      {/* CRM Leads Drawer for Sales Management & CSV Export */}
      <AdminLeadsDrawer
        isOpen={isCrmOpen}
        onClose={() => setIsCrmOpen(false)}
      />
    </div>
  );
}
