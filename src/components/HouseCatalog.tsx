import React, { useState } from 'react';
import { ArrowUpRight, Check, Maximize2, LayoutGrid, Eye, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
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

// Plain card wrapper. The GSAP 3D tilt was removed: it re-ran a 3D transform on every
// mouse move over each of the 6-15 cards, which made the catalog heavy to scroll.
const MagneticBentoCard: React.FC<MagneticCardProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

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

  const filterOptions = [
    { value: 99999, label: t.catalog.filters.all },
    { value: 700, label: t.catalog.filters.under700 },
    { value: 1100, label: t.catalog.filters.under1100 },
    { value: 1250, label: t.catalog.filters.under1250 },
  ];

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

  // Overlay chips sit on the card image. Dark variant is used on the forest
  // card and whenever a photo is shown behind them.
  const chipClass = (active: boolean, onDark: boolean): string => {
    if (active) return 'bg-ink text-paper border-ink';
    return onDark
      ? 'bg-forest/70 text-cream border-cream/20 hover:bg-forest'
      : 'bg-paper/90 text-ink border-ink/10 hover:bg-paper';
  };

  return (
    <section id="catalog" className="pt-20 sm:pt-24 pb-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
        <div className="max-w-2xl">
          <span className="eyebrow text-brass-ink dark:text-brass-light">
            02 · {lang === 'ru' ? 'Каталог типовых проектов' : 'Standard project catalog'}
          </span>
          <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.03em] text-ink dark:text-cream mt-4 text-balance">
            {t.catalog.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed">
            {t.catalog.subtitle}
          </p>
        </div>

        {/* Budget filter: underline tabs */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-7 border-b border-ink/15 dark:border-cream/12 self-start md:self-auto max-w-full">
          {filterOptions.map((opt) => {
            const active = budgetFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                aria-pressed={active}
                className={`relative pb-3 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'text-ink dark:text-cream'
                    : 'text-ink-soft dark:text-cream-soft hover:text-ink dark:hover:text-cream'
                }`}
              >
                {opt.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-px h-[2px] bg-ink dark:bg-brass-light origin-left transition-transform duration-500 ease-out-soft ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Grid of Houses with Magnetic Tilt Cards & Optimized WebP Project Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {displayedHouses.map((house, idx) => {
          const isFeaturedBestSeller = idx === 0;
          const isWide = isBentoWide(idx);
          const hasPhoto = !!house.imageWebp && !failedWebpIds[house.id];
          // Visualisation is the default view when it exists; schema and plan stay as toggles.
          const currentMode: CardViewMode = activeViewModes[house.id] || (hasPhoto ? 'webp' : 'facade');
          const onDark = isFeaturedBestSeller || currentMode === 'webp';
          const index = `№ ${String(idx + 1).padStart(2, '0')}`;

          return (
            <MagneticBentoCard
              key={house.id}
              className={`rounded-[20px] overflow-hidden flex flex-col ${
                isWide ? 'sm:col-span-2 lg:col-span-2 lg:flex-row' : 'col-span-1'
              } ${
                isFeaturedBestSeller
                  ? 'bg-forest text-cream border border-cream/10'
                  : 'bg-paper dark:bg-forest-raised border border-ink/12 dark:border-cream/10'
              } group`}
            >
              {/* Architectural Visualizer + Optimized WebP Render Area */}
              <div
                className={`relative pt-12 pb-4 px-5 flex flex-col items-center justify-center overflow-hidden ${
                  isWide ? 'lg:w-1/2 lg:py-8' : 'w-full'
                } ${
                  isFeaturedBestSeller
                    ? 'bg-forest-raised'
                    : 'bg-paper-deep dark:bg-forest'
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
                      alt={`${house.name[lang]} — визуализация каркасного дома ${house.dimensions} (${house.area} м²)`}
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

                <div className="absolute top-3.5 right-4 flex items-center gap-1.5 z-10">
                  {/* Facade <-> Plan switch */}
                  <button
                    onClick={() => {
                      playUiClick('tap');
                      setActiveViewModes((prev) => ({
                        ...prev,
                        [house.id]: prev[house.id] === 'plan' ? 'facade' : 'plan',
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold border transition-colors flex items-center gap-1 ${chipClass(
                      false,
                      onDark
                    )}`}
                    title="Переключить фасад / план"
                  >
                    {currentMode === 'plan' ? (
                      <>
                        <Eye className="w-3 h-3 text-brass-light" />
                        <span>{lang === 'ru' ? 'Фасад' : 'Facade'}</span>
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="w-3 h-3 text-brass-ink dark:text-brass-light" />
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
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-mono font-semibold border transition-colors flex items-center gap-1 ${chipClass(
                      currentMode === 'webp',
                      isFeaturedBestSeller
                    )}`}
                    title={lang === 'ru' ? 'Визуализация проекта' : 'Project visualisation'}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>{lang === 'ru' ? 'Визуализация' : 'Visual'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playUiClick('tick');
                      setModalViewMode(house.imageWebp && !failedWebpIds[house.id] ? 'webp' : 'facade');
                      setSelectedSpecHouse(house);
                    }}
                    className={`p-1.5 rounded-[8px] border transition-colors ${chipClass(
                      false,
                      onDark
                    )}`}
                    title={t.catalog.viewSpecs}
                    aria-label={t.catalog.viewSpecs}
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
                    lang={lang}
                    styleType={house.style}
                    isNight={isNightScene}
                    hasPiles={true}
                    viewMode={currentMode === 'plan' ? 'plan' : 'facade'}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Card Details Area */}
              <div className={`p-6 sm:p-7 flex flex-col flex-1 justify-between ${isWide ? 'lg:w-1/2 lg:p-8' : ''}`}>
                <div>
                  {/* Highlight label sits in the text column, clear of the image chips */}
                  {house.highlight && (
                    <span
                      className={`eyebrow block mb-2 ${
                        isFeaturedBestSeller ? 'text-brass-light' : 'text-brass-ink dark:text-brass-light'
                      }`}
                    >
                      {house.highlight[lang]}
                    </span>
                  )}
                  {/* Meta row with the item number */}
                  <div className="flex items-baseline justify-between gap-3">
                    <div
                      className={`flex flex-wrap items-center gap-x-2 text-xs ${
                        isFeaturedBestSeller ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'
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
                    <span
                      className={`font-mono text-xs tracking-[0.04em] shrink-0 pt-0.5 ${
                        isFeaturedBestSeller ? 'text-brass-light' : 'text-olive dark:text-cream-soft'
                      }`}
                    >
                      {index}
                    </span>
                  </div>

                  <h3
                    className={`font-light leading-tight mt-3 ${
                      isWide ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                    } ${
                      isFeaturedBestSeller
                        ? 'text-cream'
                        : 'text-ink dark:text-cream group-hover:text-brass-ink dark:group-hover:text-brass-light'
                    } transition-colors`}
                  >
                    {house.name[lang]}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isFeaturedBestSeller
                        ? 'text-cream-soft'
                        : 'text-ink-soft dark:text-cream-soft line-clamp-2'
                    }`}
                  >
                    {house.description[lang]}
                  </p>

                  {/* Key feature specs */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {house.specs[lang].map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.02em] px-2 py-1 rounded-[6px] border ${
                          isFeaturedBestSeller
                            ? 'border-cream/20 text-cream'
                            : 'border-ink/12 dark:border-cream/12 text-ink dark:text-cream'
                        }`}
                      >
                        <Check
                          className={`w-2.5 h-2.5 ${
                            isFeaturedBestSeller ? 'text-brass-light' : 'text-brass-ink dark:text-brass-light'
                          }`}
                        />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action row */}
                <div
                  className={`mt-7 pt-5 border-t flex flex-wrap items-end justify-between gap-x-4 gap-y-4 ${
                    isFeaturedBestSeller
                      ? 'border-cream/15'
                      : 'border-ink/12 dark:border-cream/10'
                  }`}
                >
                  <div>
                    <span
                      className={`eyebrow block mb-1 ${
                        isFeaturedBestSeller ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'
                      }`}
                    >
                      {t.catalog.from}
                    </span>
                    <span
                      className={`font-light whitespace-nowrap ${
                        isWide ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                      } leading-none tabular-nums ${
                        isFeaturedBestSeller ? 'text-cream' : 'text-ink dark:text-cream'
                      }`}
                    >
                      {formatPrice(house.price)} {t.catalog.rub}
                    </span>
                  </div>

                  {/* One gold CTA per screen: the featured card. Others use a text link. */}
                  {isFeaturedBestSeller ? (
                    <button
                      onClick={() => {
                        playUiClick('tap');
                        onSelectHouse(house);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-[12px] bg-brass hover:bg-brass-hover text-ink text-sm font-medium transition-colors whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>{t.catalog.calculateExact}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playUiClick('tap');
                        onSelectHouse(house);
                      }}
                      className="inline-flex items-center gap-1.5 pb-0.5 text-sm font-semibold whitespace-nowrap text-ink dark:text-cream border-b border-ink/30 dark:border-cream/30 hover:text-brass-ink dark:hover:text-brass-light hover:border-brass-ink dark:hover:border-brass-light transition-colors"
                    >
                      <span>{t.catalog.calculateExact}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </MagneticBentoCard>
          );
        })}
      </div>

      {/* Show All / Collapse Toggle Button */}
      {filteredHouses.length > 6 && (
        <div className="mt-12 flex flex-col items-center">
          <button
            onClick={() => {
              playUiClick('tap');
              setShowAll((prev) => !prev);
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[12px] border border-ink/30 dark:border-cream/30 text-ink dark:text-cream hover:bg-ink hover:text-paper dark:hover:bg-cream dark:hover:text-forest font-medium text-sm transition-colors active:scale-95"
          >
            {showAll ? (
              <>
                <span>
                  {lang === 'ru'
                    ? 'Свернуть каталог (показать топ-6)'
                    : 'Collapse Catalog (Show Top 6)'}
                </span>
                <ChevronUp className="w-4 h-4 text-brass-ink dark:text-brass-light" />
              </>
            ) : (
              <>
                <span>
                  {lang === 'ru'
                    ? `Показать все ${filteredHouses.length} проектов (ещё +${hiddenCount})`
                    : `Show All ${filteredHouses.length} Projects (+${hiddenCount} more)`}
                </span>
                <ChevronDown className="w-4 h-4 text-brass-ink dark:text-brass-light" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/80 animate-fade-in"
          onClick={() => setSelectedSpecHouse(null)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[20px] p-6 sm:p-8 bg-paper dark:bg-forest-raised border border-ink/10 dark:border-cream/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSpecHouse(null)}
              aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
              className="absolute top-5 right-5 text-2xl font-light text-olive hover:text-ink dark:text-cream-soft dark:hover:text-cream"
            >
              ×
            </button>

            <span className="eyebrow text-brass-ink dark:text-brass-light">{t.catalog.viewSpecs}</span>
            <div className="flex flex-col gap-4 mt-3 mb-5">
              <h3 className="font-light text-3xl leading-tight text-ink dark:text-cream pr-8">
                {selectedSpecHouse.name[lang]}
              </h3>

              <div className="flex items-center gap-5 text-sm">
                {[
                  {
                    id: 'webp' as CardViewMode,
                    label: lang === 'ru' ? 'Визуализация' : 'Visual',
                    show: !!selectedSpecHouse.imageWebp && !failedWebpIds[selectedSpecHouse.id],
                  },
                  { id: 'facade' as CardViewMode, label: lang === 'ru' ? '3D Схема' : '3D Facade', show: true },
                  { id: 'plan' as CardViewMode, label: lang === 'ru' ? 'План' : 'Plan', show: true },
                ]
                  .filter((tab) => tab.show)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        playUiClick('tap');
                        setModalViewMode(tab.id);
                      }}
                      aria-pressed={modalViewMode === tab.id}
                      className={`pb-1 border-b-2 font-medium transition-colors ${
                        modalViewMode === tab.id
                          ? 'border-ink text-ink dark:border-brass-light dark:text-cream'
                          : 'border-transparent text-ink-soft hover:text-ink dark:text-cream-soft dark:hover:text-cream'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="my-5 w-full rounded-xl overflow-hidden aspect-[800/480] bg-paper-deep dark:bg-forest flex items-center justify-center relative">
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
                    lang={lang}
                    styleType={selectedSpecHouse.style}
                    isNight={isNightScene}
                    viewMode={modalViewMode === 'plan' ? 'plan' : 'facade'}
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            <p className="text-sm text-ink-soft dark:text-cream-soft leading-relaxed mb-6">
              {selectedSpecHouse.description[lang]}
            </p>

            {/* Spec sheet: hairline cells */}
            <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden bg-ink/10 dark:bg-cream/10 border border-ink/10 dark:border-cream/10 mb-6">
              {[
                { label: t.catalog.areaLabel, value: `${selectedSpecHouse.area} м²` },
                { label: t.catalog.dimLabel, value: selectedSpecHouse.dimensions },
                { label: t.catalog.floorsLabel, value: String(selectedSpecHouse.floors) },
              ].map((cell) => (
                <div key={cell.label} className="bg-paper dark:bg-forest-raised p-3.5 text-center">
                  <span className="eyebrow block text-[10px] text-olive dark:text-cream-soft">{cell.label}</span>
                  <span className="font-light text-xl text-ink dark:text-cream tabular-nums block mt-1">
                    {cell.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-7">
              <span className="eyebrow text-ink dark:text-cream">
                {lang === 'ru' ? 'В комплектацию включено' : 'Included package'}
              </span>
              {selectedSpecHouse.specs[lang].map((sp, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-ink-soft dark:text-cream-soft"
                >
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brass-ink dark:text-brass-light" />
                  <span>{sp}</span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between gap-4 pt-5 border-t border-ink/12 dark:border-cream/10">
              <div>
                <span className="eyebrow block mb-1 text-olive dark:text-cream-soft">{t.catalog.from}</span>
                <span className="font-light text-3xl leading-none tabular-nums text-ink dark:text-cream">
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
                className="px-5 py-3 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-medium text-sm transition-colors whitespace-nowrap"
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
