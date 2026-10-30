import React, { useState } from 'react';
import { Check, Sparkles, Sun, CloudSnow, Flame, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { playUiClick } from '../utils/sound';

interface PackageComparisonProps {
  lang: Language;
  onSelectPackage: (price: number) => void;
}

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  lang,
  onSelectPackage,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1); // Middle tier 150mm highlighted by default

  const tiers = [
    {
      id: 0,
      badge: lang === 'ru' ? 'Дачный сезон' : 'Summer Season',
      name: lang === 'ru' ? 'Лето (100 мм)' : 'Summer (100 mm)',
      temp: lang === 'ru' ? 'от +5 °C до +35 °C' : '+5 °C to +35 °C',
      price: 498000,
      priceDisplay: 'от 498 000 ₽',
      icon: Sun,
      popular: false,
      specs: {
        wallFrame: 'Сухой брус 100×50 мм',
        insulation: '100 мм (Кнауф / Роквул)',
        floorJoists: 'Брус 150×100 мм с биозащитой',
        windows: 'ПВХ двухкамерные поворотно-откидные',
        door: 'Металлическая утепленная (Россия)',
        floorFinish: 'Шпунтованная доска 28 мм',
        roofGift: 'Металлочерепица 0.5 мм в подарок',
        foundationDiscount: 'Скидка 50% на винтовые сваи',
      },
    },
    {
      id: 1,
      badge: lang === 'ru' ? 'Хит продаж · 74% заказов' : 'Bestseller · 74% orders',
      name: lang === 'ru' ? 'Осень–Зима (150 мм)' : 'All-Season (150 mm)',
      temp: lang === 'ru' ? 'до −20 °C (круглый год)' : 'Down to −20 °C',
      price: 582000,
      priceDisplay: 'от 582 000 ₽',
      icon: CloudSnow,
      popular: true,
      specs: {
        wallFrame: 'Сухой строганный брус 150×50 мм',
        insulation: '150 мм базальтовая плита (3 слоя)',
        floorJoists: 'Брус 150×150 мм усиленный',
        windows: 'ПВХ 60 мм с энергосбережением i-стекло',
        door: 'Металлическая сейфовая утепленная',
        floorFinish: 'Шпунтованная доска 36 мм камерной сушки',
        roofGift: 'Металлочерепица 0.5 мм в подарок',
        foundationDiscount: 'Скидка 50% на винтовые сваи',
      },
    },
    {
      id: 2,
      badge: lang === 'ru' ? 'Максимальный термос' : 'Arctic Grade Residence',
      name: lang === 'ru' ? 'ПМЖ (200 мм)' : 'Year-Round (200 mm)',
      temp: lang === 'ru' ? 'до −35 °C (постоянное жильё)' : 'Down to −35 °C (Permanent)',
      price: 652000,
      priceDisplay: 'от 652 000 ₽',
      icon: Flame,
      popular: false,
      specs: {
        wallFrame: 'Сухой брус 150×50 + контрбрус 50×50 мм',
        insulation: '200 мм с перехлёстом мостиков холода',
        floorJoists: 'Брус 150×150 мм + черновой щит',
        windows: 'ПВХ 70 мм 5-камерный + мультипакет',
        door: 'Усиленная дверь с терморазрывом',
        floorFinish: 'Шпунт 36 мм + фанера под ламинат/плитку',
        roofGift: 'Металлочерепица + снегозадержатели',
        foundationDiscount: 'Скидка 50% на усиленные сваи',
      },
    },
  ];

  const rowLabels = [
    { key: 'wallFrame', label: lang === 'ru' ? 'Силовой каркас стен' : 'Wall Framing Studs' },
    { key: 'insulation', label: lang === 'ru' ? 'Базальтовое утепление' : 'Basalt Wool Insulation' },
    { key: 'floorJoists', label: lang === 'ru' ? 'Обвязка и лаги пола' : 'Sill Plate & Floor Joists' },
    { key: 'windows', label: lang === 'ru' ? 'Остекление ПВХ' : 'PVC Glazing Profile' },
    { key: 'door', label: lang === 'ru' ? 'Входная группа' : 'Entrance Door' },
    { key: 'floorFinish', label: lang === 'ru' ? 'Чистовой пол' : 'Finished Flooring' },
    { key: 'roofGift', label: lang === 'ru' ? 'Кровля по акции' : 'Promotional Roofing' },
    { key: 'foundationDiscount', label: lang === 'ru' ? 'Фундамент' : 'Foundation Bonus' },
  ] as const;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
          {lang === 'ru' ? 'Прозрачное сравнение комплектаций' : 'Turnkey Package Comparison'}
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
          {lang === 'ru'
            ? 'Выберите комплектацию под ваш режим отдыха или жизни'
            : 'Choose the Insulation Package for Your Lifestyle'}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          {lang === 'ru'
            ? 'Любой проект из каталога мы строим в одном из трёх тепловых контуров — от летней дачи до зимнего дома ПМЖ.'
            : 'Any model in our catalog can be built in one of three thermal packages.'}
        </p>
      </div>

      {/* 3-Column Interactive Comparison Cards / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => {
                playUiClick('tap');
                setSelectedTier(tier.id);
              }}
              className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between relative ${
                tier.popular
                  ? 'bg-gradient-to-b from-[#183B30] via-[#122A21] to-[#0B1A14] text-white border-[#E6B860] shadow-2xl lg:-translate-y-2'
                  : isSelected
                  ? 'glass-card border-[#183B30] dark:border-[#E6B860] shadow-xl'
                  : 'glass-card border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Top Kicker & Icon */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      tier.popular
                        ? 'bg-[#E6B860] text-[#1E1705]'
                        : 'bg-[#E6B860]/15 text-[#B27D18] dark:text-[#E6B860]'
                    }`}
                  >
                    {tier.popular && <Sparkles className="w-3.5 h-3.5" />}
                    <span>{tier.badge}</span>
                  </span>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tier.popular
                        ? 'bg-white/10 text-[#E6B860]'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-[#B27D18] dark:text-[#E6B860]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Tier Name & Temperature */}
                <h3
                  className={`font-display font-bold text-2xl ${
                    tier.popular ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-xs font-medium mt-1 ${
                    tier.popular ? 'text-emerald-200/80' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  Режим эксплуатации: <strong className="font-semibold">{tier.temp}</strong>
                </p>

                {/* Price */}
                <div
                  className={`my-5 py-4 border-y ${
                    tier.popular ? 'border-white/15' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <span
                    className={`text-[11px] uppercase tracking-wider block ${
                      tier.popular ? 'text-emerald-200/70' : 'text-neutral-500'
                    }`}
                  >
                    Базовая стоимость под ключ
                  </span>
                  <span
                    className={`font-display font-bold text-2xl sm:text-3xl tabular-nums ${
                      tier.popular ? 'text-[#E6B860]' : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {tier.priceDisplay}
                  </span>
                </div>

                {/* 8 Engineering Specs List */}
                <div className="space-y-3">
                  {rowLabels.map((row) => (
                    <div key={row.key} className="text-xs flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tier.popular ? 'text-[#E6B860]' : 'text-[#B27D18] dark:text-[#E6B860]'
                        }`}
                      />
                      <div>
                        <span
                          className={`block font-medium ${
                            tier.popular
                              ? 'text-emerald-200/75 text-[11px]'
                              : 'text-neutral-400 dark:text-neutral-500 text-[11px]'
                          }`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`font-semibold ${
                            tier.popular ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {tier.specs[row.key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playUiClick('tap');
                  onSelectPackage(tier.price);
                }}
                className={`mt-7 w-full py-3.5 px-5 rounded-full font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  tier.popular
                    ? 'bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] gold-glow'
                    : 'bg-[#183B30] hover:bg-[#122A21] text-[#E6B860] dark:bg-white/10 dark:hover:bg-white/20 dark:text-white'
                }`}
              >
                <span>
                  {lang === 'ru'
                    ? `Рассчитать в комплектации «${tier.name.split(' ')[0]}»`
                    : `Calculate ${tier.name}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
