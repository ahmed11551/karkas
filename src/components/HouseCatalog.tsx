import React, { useState } from 'react';
import { ArrowUpRight, Check, Maximize2, LayoutGrid, Eye, ChevronDown, ChevronUp } from 'lucide-react';
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

export const HouseCatalog: React.FC<HouseCatalogProps> = ({
  lang,
  onSelectHouse,
  isNightScene,
}) => {
  const t = TRANSLATIONS[lang];
  const [budgetFilter, setBudgetFilter] = useState<number>(99999);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedSpecHouse, setSelectedSpecHouse] = useState<HouseItem | null>(null);
  const [activeViewModes, setActiveViewModes] = useState<{ [id: string]: 'facade' | 'plan' }>({});
  const [modalViewMode, setModalViewMode] = useState<'facade' | 'plan'>('facade');

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

  return (
    <section id="catalog" className="pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
            {lang === 'ru' ? 'Каталог типовых проектов' : 'Standard Architectural Catalog'}
          </span>
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

      {/* Houses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedHouses.map((house) => (
          <div
            key={house.id}
            className="glass-card rounded-3xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl group"
          >
            {/* Top SVG Graphic Area */}
            <div className="relative pt-6 pb-2 px-6 bg-gradient-to-b from-neutral-100 dark:from-neutral-900/60 to-transparent flex items-center justify-center">
              {house.highlight && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-[#E6B860]/20 border border-[#E6B860]/40 text-[11px] font-semibold text-[#8C5E0A] dark:text-[#F5C46B]">
                  {house.highlight[lang]}
                </div>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {/* Facade / Plan switch button */}
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setActiveViewModes((prev) => ({
                      ...prev,
                      [house.id]: prev[house.id] === 'plan' ? 'facade' : 'plan',
                    }));
                  }}
                  className="px-2 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors shadow-sm flex items-center gap-1"
                  title="Переключить фасад / план"
                >
                  {activeViewModes[house.id] === 'plan' ? (
                    <>
                      <Eye className="w-3 h-3 text-[#B27D18] dark:text-[#E6B860]" />
                      <span>{lang === 'ru' ? 'Фасад' : 'Facade'}</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="w-3 h-3 text-[#B27D18] dark:text-[#E6B860]" />
                      <span>{lang === 'ru' ? 'План' : 'Plan'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    playUiClick('tick');
                    setModalViewMode('facade');
                    setSelectedSpecHouse(house);
                  }}
                  className="p-1.5 rounded-full bg-white/70 dark:bg-neutral-800/70 hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                  title={t.catalog.viewSpecs}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full max-w-[240px] aspect-[200/120] py-2">
                <HouseSvg
                  styleType={house.style}
                  isNight={isNightScene}
                  hasPiles={true}
                  viewMode={activeViewModes[house.id] || 'facade'}
                  className="w-full h-full drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Body Info */}
            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                {/* Meta details unboxed */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2 font-medium">
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

                <h3 className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-[#184534] dark:group-hover:text-[#E6B860] transition-colors">
                  {house.name[lang]}
                </h3>

                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {house.description[lang]}
                </p>

                {/* Key feature specs */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {house.specs[lang].map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300"
                    >
                      <Check className="w-2.5 h-2.5 text-[#B27D18] dark:text-[#E6B860]" />
                      <span>{spec}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action row */}
              <div className="mt-6 pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 block">
                    {t.catalog.from}
                  </span>
                  <span className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100 tracking-tight tabular-nums">
                    {formatPrice(house.price)} {t.catalog.rub}
                  </span>
                </div>

                <button
                  onClick={() => {
                    playUiClick('tap');
                    onSelectHouse(house);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] text-xs font-semibold transition-all gold-glow whitespace-nowrap active:scale-95"
                >
                  <span>{t.catalog.calculateExact}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
            <div className="flex items-center justify-between mt-1 mb-4">
              <h3 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
                {selectedSpecHouse.name[lang]}
              </h3>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-200/80 dark:bg-neutral-800">
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
                  {lang === 'ru' ? 'Фасад' : 'Facade'}
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
                  {lang === 'ru' ? 'Планировка' : 'Floor Plan'}
                </button>
              </div>
            </div>

            <div className="my-5 max-w-xs mx-auto aspect-[200/120]">
              <HouseSvg
                styleType={selectedSpecHouse.style}
                isNight={isNightScene}
                viewMode={modalViewMode}
                className="w-full h-full"
              />
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
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
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
