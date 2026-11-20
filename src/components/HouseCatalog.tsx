import React, { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { HouseItem, Language } from '../types';
import { HOUSES } from '../data/houses';
import { TRANSLATIONS } from '../data/translations';
import { HouseSvg } from './HouseSvg';
import { playUiClick } from '../utils/sound';
import { track } from '../utils/analytics';

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
  const [modalViewMode, setModalViewMode] = useState<CardViewMode>('facade');
  const [failedWebpIds, setFailedWebpIds] = useState<{ [id: string]: boolean }>({});

  const filteredHouses = HOUSES.filter((h) => h.price <= budgetFilter);
  const priceFiltered = budgetFilter < 99999;
  const displayedHouses = priceFiltered || showAll ? filteredHouses : filteredHouses.slice(0, 6);
  const hiddenCount = Math.max(0, filteredHouses.length - displayedHouses.length);

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
    setShowAll(false);
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
          const hasPhoto = !!house.imageWebp && !failedWebpIds[house.id];
          const index = `№ ${String(idx + 1).padStart(2, '0')}`;

          return (
            <MagneticBentoCard
              key={house.id}
              className="flex flex-col col-span-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper-deep dark:bg-forest">
                {hasPhoto ? (
                  <img
                    src={house.imageWebp}
                    alt={`${house.name[lang]} — ${house.dimensions}, ${house.area} м²`}
                    width={800}
                    height={500}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailedWebpIds((prev) => ({ ...prev, [house.id]: true }))}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <HouseSvg
                      lang={lang}
                      styleType={house.style}
                      isNight={isNightScene}
                      hasPiles={true}
                      viewMode="facade"
                      className="w-full h-full max-w-[240px]"
                    />
                  </div>
                )}
              </div>

              {/* Card Details Area */}
              <div className="pt-4 flex flex-col flex-1">
                <div className="flex items-baseline justify-between gap-3 text-xs text-olive dark:text-cream-soft">
                  <span>
                    {house.area} м² · {house.dimensions}
                  </span>
                  <span className="font-mono">{index}</span>
                </div>
                <h3 className="font-light text-2xl leading-tight mt-1 text-ink dark:text-cream">{house.name[lang]}</h3>
                <p className="mt-2 font-light text-2xl leading-none tabular-nums text-ink dark:text-cream">
                  <span className="sr-only">{t.catalog.from} </span>
                  {formatPrice(house.price)} {t.catalog.rub}
                </p>
                <div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playUiClick('tap');
                        onSelectHouse(house);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-brass hover:bg-brass-hover text-ink text-sm font-medium"
                    >
                      {lang === 'ru' ? 'Рассчитать' : 'Calculate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playUiClick('tick');
                        track('view_project', { project: house.id, area: house.area });
                        setModalViewMode(hasPhoto ? 'webp' : 'facade');
                        setSelectedSpecHouse(house);
                      }}
                      className="inline-flex items-center gap-1 px-1 py-2.5 text-sm text-ink-soft dark:text-cream-soft hover:text-ink dark:hover:text-cream"
                    >
                      <span>{lang === 'ru' ? 'Подробнее' : 'Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </MagneticBentoCard>
          );
        })}
      </div>

      {/* Show All / Collapse Toggle Button */}
      {filteredHouses.length > 6 && !priceFiltered && (
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
