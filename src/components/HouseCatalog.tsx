import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowUpRight,
  Check,
  Maximize2,
  LayoutGrid,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { HouseItem, Language } from '../types';
import { HOUSES } from '../data/houses';
import { TRANSLATIONS } from '../data/translations';
import { HouseSvg } from './HouseSvg';
import { playUiClick } from '../utils/sound';

interface HouseCatalogProps {
  lang: Language;
  onSelectHouse: (house: HouseItem) => void;
  isNightScene: boolean;
}

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
}

type CardViewMode = 'facade' | 'plan' | 'webp';

const MagneticBentoCard: React.FC<MagneticCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Skip 3D tilt on touch/mobile devices to save CPU/GPU on mobile 4G
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const nx = (x - centerX) / centerX;
    const ny = (y - centerY) / centerY;

    gsap.to(cardRef.current, {
      rotateY: nx * 5.5,
      rotateX: -ny * 5.5,
      x: nx * 6,
      y: ny * 6 - 4,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      duration: 0.65,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </div>
  );
};

export const HouseCatalog: React.FC<HouseCatalogProps> = ({
  lang,
  onSelectHouse,
  isNightScene,
}) => {
  const t = TRANSLATIONS[lang];
  const [budgetFilter, setBudgetFilter] = useState<number>(99999);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedSpecHouse, setSelectedSpecHouse] = useState<HouseItem | null>(null);
  const [activeViewModes, setActiveViewModes] = useState<{ [id: string]: CardViewMode }>({});
  const [modalViewMode, setModalViewMode] = useState<CardViewMode>('facade');
  const [failedWebpIds, setFailedWebpIds] = useState<{ [id: string]: boolean }>({});

  const filteredHouses = HOUSES.filter((h) => h.price <= budgetFilter);
  const displayedHouses = showAll ? filteredHouses : filteredHouses.slice(0, 6);
  const hiddenCount = Math.max(0, filteredHouses.length - 6);

  const formatPrice = (p: number) => {
    return (p * 1000).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
  };

  const handleFilterChange = (val: number) => {
    playUiClick('tap');
    setBudgetFilter(val);
  };

  // Asymmetric Bento Grid span pattern:
  // Index 0 ("Дачный домик" - Best Seller) is featured wide (lg:col-span-2),
  // alternating 2:1 / 1:2 / 2:1 rhythm so every 3-column row is 100% filled.
  const isBentoWide = (idx: number): boolean => {
    return idx === 0 || idx === 3 || idx === 4 || idx === 8 || idx === 11 || idx === 14;
  };

  return (
    <section id="catalog" className="pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
              {lang === 'ru' ? 'Bento-каталог типовых проектов' : 'Bento Architectural Catalog'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold">
              <Zap className="w-2.5 h-2.5" />
              <span>WebP Ultra-Light</span>
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
            {t.catalog.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {t.catalog.subtitle}
          </p>
        </div>

        {/* Filter Segmented Control Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/80 backdrop-blur-md self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => handleFilterChange(99999)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              budgetFilter === 99999
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.catalog.filters.all}
          </button>
          <button
            onClick={() => handleFilterChange(700)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              budgetFilter === 700
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.catalog.filters.under700}
          </button>
          <button
            onClick={() => handleFilterChange(1100)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              budgetFilter === 1100
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.catalog.filters.under1100}
          </button>
          <button
            onClick={() => handleFilterChange(1250)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              budgetFilter === 1250
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.catalog.filters.under1250}
          </button>
        </div>
      </div>

      {/* Bento Grid of Houses with Magnetic Tilt Cards & Optimized WebP Project Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedHouses.map((house, idx) => {
          const isFeaturedBestSeller = idx === 0;
          const isWide = isBentoWide(idx);
          const currentMode: CardViewMode = activeViewModes[house.id] || 'facade';

          return (
            <MagneticBentoCard
              key={house.id}
              className={`rounded-3xl overflow-hidden flex flex-col ${
                isWide ? 'sm:col-span-2 lg:col-span-2 lg:flex-row' : 'col-span-1'
              } ${
                isFeaturedBestSeller
                  ? 'bg-gradient-to-br from-[#183B30] via-[#122A21] to-[#0B1A14] text-white border-2 border-[#E6B860]/60 shadow-2xl'
                  : 'glass-card border border-neutral-200/90 dark:border-neutral-800 shadow-sm hover:shadow-xl'
              } transition-shadow duration-300 group`}
            >
              {/* Architectural Visualizer + Optimized WebP Render Area */}
              <div
                className={`relative pt-11 pb-4 px-5 flex flex-col items-center justify-center overflow-hidden ${
                  isWide ? 'lg:w-1/2 lg:py-8' : 'w-full'
                } ${
                  isFeaturedBestSeller
                    ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent'
                    : 'bg-gradient-to-b from-neutral-100 dark:from-neutral-900/60 to-transparent'
                }`}
              >
                {/* Optional WebP Project Image Layer with graceful fallback to HouseSvg */}
                {house.imageWebp && !failedWebpIds[house.id] && (
                  <picture
                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 pointer-events-none ${
                      currentMode === 'webp' ? 'opacity-100 z-[5]' : 'opacity-0 z-0'
                    }`}
                  >
                    <source srcSet={house.imageWebp} type="image/webp" />
                    <img
                      src={house.imageWebp}
                      alt={`${house.name[lang]} — проект каркасного дома ${house.dimensions} (${house.area} м²)`}
                      width={800}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      onError={() => {
                        setFailedWebpIds((prev) => ({ ...prev, [house.id]: true }));
                        setActiveViewModes((prev) =>
                          prev[house.id] === 'webp' ? { ...prev, [house.id]: 'facade' } : prev
                        );
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </picture>
                )}

                {house.highlight && (
                  <div
                    className={`absolute top-3.5 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${
                      isFeaturedBestSeller
                        ? 'bg-[#E6B860] text-[#1E1705] shadow-md'
                        : 'bg-[#E6B860]/20 border border-[#E6B860]/40 text-[#8C5E0A] dark:text-[#F5C46B]'
                    }`}
                  >
                    {isFeaturedBestSeller && <Sparkles className="w-3 h-3" />}
                    <span>{house.highlight[lang]}</span>
                  </div>
                )}

                <div className="absolute top-3.5 right-4 flex items-center gap-1 z-10">
                  {/* Smooth Cross-Fade Facade <-> Plan Switch Button */}
                  <button
                    onClick={() => {
                      playUiClick('tap');
                      setActiveViewModes((prev) => ({
                        ...prev,
                        [house.id]: prev[house.id] === 'plan' ? 'facade' : 'plan',
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-sm flex items-center gap-1 ${
                      isFeaturedBestSeller || currentMode === 'webp'
                        ? 'bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md'
                        : 'bg-white/85 dark:bg-neutral-800/85 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                    title="Переключить фасад / план"
                  >
                    {currentMode === 'plan' ? (
                      <>
                        <Eye className="w-3 h-3 text-[#E6B860]" />
                        <span>{lang === 'ru' ? 'Фасад' : 'Facade'}</span>
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="w-3 h-3 text-[#E6B860]" />
                        <span>{lang === 'ru' ? 'План' : 'Plan'}</span>
                      </>
                    )}
                  </button>

                  {/* Toggle WebP Photo Render */}
                  <button
                    onClick={() => {
                      playUiClick('tap');
                      setActiveViewModes((prev) => ({
                        ...prev,
                        [house.id]: prev[house.id] === 'webp' ? 'facade' : 'webp',
                      }));
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all shadow-sm flex items-center gap-1 ${
                      currentMode === 'webp'
                        ? 'bg-[#E6B860] text-[#1E1705]'
                        : isFeaturedBestSeller
                          ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                          : 'bg-white/85 dark:bg-neutral-800/85 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                    title="Рендер проекта в формате .webp"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>.webp</span>
                  </button>

                  <button
                    onClick={() => {
                      playUiClick('tick');
                      setModalViewMode('facade');
                      setSelectedSpecHouse(house);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isFeaturedBestSeller || currentMode === 'webp'
                        ? 'bg-black/45 hover:bg-black/65 text-white'
                        : 'bg-white/75 dark:bg-neutral-800/75 hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                    title={t.catalog.viewSpecs}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  className={`w-full ${
                    isWide ? 'max-w-[290px]' : 'max-w-[240px]'
                  } aspect-[200/120] py-2 transition-opacity duration-500 ${
                    currentMode === 'webp' ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <HouseSvg
                    styleType={house.style}
                    isNight={isNightScene}
                    hasPiles={true}
                    viewMode={currentMode === 'plan' ? 'plan' : 'facade'}
                    className="w-full h-full drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Card Details Area */}
              <div
                className={`p-6 flex flex-col flex-1 justify-between ${
                  isWide ? 'lg:w-1/2 lg:p-8' : ''
                }`}
              >
                <div>
                  {/* Meta details unboxed */}
                  <div
                    className={`flex items-center gap-2 text-xs mb-2 font-medium ${
                      isFeaturedBestSeller
                        ? 'text-emerald-200/80'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <span>{house.dimensions}</span>
                    <span aria-hidden="true">·</span>
                    <span>{house.area} м²</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {house.floors === 1
                        ? lang === 'ru'
                          ? '1 этаж'
                          : '1 story'
                        : lang === 'ru'
                          ? '2 этажа'
                          : '2 stories'}
                    </span>
                  </div>

                  <h3
                    className={`font-display font-semibold ${
                      isWide ? 'text-xl sm:text-2xl' : 'text-lg'
                    } ${
                      isFeaturedBestSeller
                        ? 'text-white'
                        : 'text-neutral-900 dark:text-neutral-100 group-hover:text-[#184534] dark:group-hover:text-[#E6B860]'
                    } transition-colors`}
                  >
                    {house.name[lang]}
                  </h3>

                  <p
                    className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                      isFeaturedBestSeller
                        ? 'text-emerald-100/80'
                        : 'text-neutral-600 dark:text-neutral-400 line-clamp-2'
                    }`}
                  >
                    {house.description[lang]}
                  </p>

                  {/* Key feature specs */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {house.specs[lang].map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md ${
                          isFeaturedBestSeller
                            ? 'bg-white/10 text-emerald-100'
                            : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 text-[#E6B860]" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action row */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between ${
                    isFeaturedBestSeller
                      ? 'border-white/15'
                      : 'border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[11px] block ${
                        isFeaturedBestSeller ? 'text-emerald-200/70' : 'text-neutral-500'
                      }`}
                    >
                      {t.catalog.from}
                    </span>
                    <span
                      className={`font-display font-bold ${
                        isWide ? 'text-2xl' : 'text-xl'
                      } tracking-tight tabular-nums ${
                        isFeaturedBestSeller
                          ? 'text-[#E6B860]'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {formatPrice(house.price)} {t.catalog.rub}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playUiClick('tap');
                      onSelectHouse(house);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] text-xs font-semibold transition-all gold-glow whitespace-nowrap active:scale-95"
                  >
                    <span>{t.catalog.calculateExact}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </MagneticBentoCard>
          );
        })}
      </div>

      {/* Show All 15 / Collapse Toggle Button */}
      {filteredHouses.length > 6 && (
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={() => {
              playUiClick('tap');
              setShowAll((prev) => !prev);
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white dark:bg-[#183B30] hover:bg-neutral-100 dark:hover:bg-[#1E473A] text-neutral-900 dark:text-[#E6B860] border border-neutral-300 dark:border-[#2F5A4B] font-display font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            {showAll ? (
              <>
                <span>
                  {lang === 'ru'
                    ? 'Свернуть каталог (показать топ-6)'
                    : 'Collapse Catalog (Show Top 6)'}
                </span>
                <ChevronUp className="w-4 h-4 text-[#B27D18] dark:text-[#E6B860]" />
              </>
            ) : (
              <>
                <span>
                  {lang === 'ru'
                    ? `Показать все ${filteredHouses.length} проектов (ещё +${hiddenCount})`
                    : `Show All ${filteredHouses.length} Projects (+${hiddenCount} more)`}
                </span>
                <ChevronDown className="w-4 h-4 text-[#B27D18] dark:text-[#E6B860]" />
              </>
            )}
          </button>
        </div>
      )}

      {/* House Specification Modal / Drawer */}
      {selectedSpecHouse && (
        <div
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSpecHouse(null)}
        >
          <div
            className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSpecHouse(null)}
              className="absolute top-5 right-5 text-2xl font-light text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              ×
            </button>

            <span className="text-xs font-semibold text-[#B27D18] dark:text-[#E6B860] uppercase">
              {t.catalog.viewSpecs}
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 mb-4">
              <h3 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
                {selectedSpecHouse.name[lang]}
              </h3>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-200/80 dark:bg-neutral-800">
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setModalViewMode('webp');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    modalViewMode === 'webp'
                      ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Фото (.webp)
                </button>
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setModalViewMode('facade');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    modalViewMode === 'facade'
                      ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {lang === 'ru' ? '3D Схема' : '3D Facade'}
                </button>
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setModalViewMode('plan');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    modalViewMode === 'plan'
                      ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {lang === 'ru' ? 'План' : 'Plan'}
                </button>
              </div>
            </div>

            <div className="my-5 w-full rounded-2xl overflow-hidden aspect-[800/480] bg-neutral-900/20 flex items-center justify-center relative">
              {modalViewMode === 'webp' &&
              selectedSpecHouse.imageWebp &&
              !failedWebpIds[selectedSpecHouse.id] ? (
                <picture className="w-full h-full">
                  <source srcSet={selectedSpecHouse.imageWebp} type="image/webp" />
                  <img
                    src={selectedSpecHouse.imageWebp}
                    alt={selectedSpecHouse.name[lang]}
                    width={800}
                    height={480}
                    decoding="async"
                    onError={() => {
                      setFailedWebpIds((prev) => ({ ...prev, [selectedSpecHouse.id]: true }));
                      setModalViewMode('facade');
                    }}
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : (
                <div className="w-full max-w-xs mx-auto aspect-[200/120]">
                  <HouseSvg
                    styleType={selectedSpecHouse.style}
                    isNight={isNightScene}
                    viewMode={modalViewMode === 'plan' ? 'plan' : 'facade'}
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
              {selectedSpecHouse.description[lang]}
            </p>

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-center mb-6">
              <div>
                <span className="text-[11px] text-neutral-500 block">{t.catalog.areaLabel}</span>
                <span className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {selectedSpecHouse.area} м²
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">{t.catalog.dimLabel}</span>
                <span className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {selectedSpecHouse.dimensions}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">{t.catalog.floorsLabel}</span>
                <span className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {selectedSpecHouse.floors}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                {lang === 'ru' ? 'В комплектацию включено:' : 'Included package:'}
              </span>
              {selectedSpecHouse.specs[lang].map((sp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <Check className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                  <span>{sp}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-xs text-neutral-500 block">{t.catalog.from}</span>
                <span className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
                  {formatPrice(selectedSpecHouse.price)} {t.catalog.rub}
                </span>
              </div>
              <button
                onClick={() => {
                  playUiClick('tap');
                  const house = selectedSpecHouse;
                  setSelectedSpecHouse(null);
                  onSelectHouse(house);
                }}
                className="px-5 py-3 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-semibold text-sm transition-all gold-glow"
              >
                {t.catalog.calculateExact}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
