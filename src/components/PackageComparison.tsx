import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { playUiClick } from '../utils/sound';

interface PackageComparisonProps {
  lang: Language;
  onSelectPackage: (price: number) => void;
}

type SpecKey =
  | 'wallFrame'
  | 'insulation'
  | 'floorJoists'
  | 'windows'
  | 'door'
  | 'floorFinish'
  | 'roofGift'
  | 'foundationDiscount';

interface Tier {
  id: number;
  badge: string;
  name: string;
  temp: string;
  price: number;
  priceDisplay: string;
  popular: boolean;
  specs: Record<SpecKey, string>;
}

/** Package CTA. The popular package gets the single gold button of the section. */
const PackageCta: React.FC<{ tier: Tier; lang: Language; onSelect: (price: number) => void }> = ({
  tier,
  lang,
  onSelect,
}) => {
  const label =
    lang === 'ru' ? `Рассчитать в комплектации «${tier.name.split(' ')[0]}»` : `Calculate ${tier.name}`;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        playUiClick('tap');
        onSelect(tier.price);
      }}
      className={`inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-[12px] text-sm font-medium transition-colors active:scale-[0.98] ${
        tier.popular
          ? 'bg-brass hover:bg-brass-hover text-ink'
          : 'border border-ink/30 text-ink hover:bg-ink hover:text-paper dark:border-cream/30 dark:text-cream dark:hover:bg-cream dark:hover:text-forest'
      }`}
    >
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 shrink-0" />
    </button>
  );
};

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  lang,
  onSelectPackage,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1); // Middle tier 150mm highlighted by default

  const tiers: Tier[] = [
    {
      id: 0,
      badge: lang === 'ru' ? 'Дачный сезон' : 'Summer Season',
      name: lang === 'ru' ? 'Лето (100 мм)' : 'Summer (100 mm)',
      temp: lang === 'ru' ? 'от +5 °C до +35 °C' : '+5 °C to +35 °C',
      price: 498000,
      priceDisplay: 'от 498 000 ₽',
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

  const rowLabels: { key: SpecKey; label: string }[] = [
    { key: 'wallFrame', label: lang === 'ru' ? 'Силовой каркас стен' : 'Wall Framing Studs' },
    { key: 'insulation', label: lang === 'ru' ? 'Базальтовое утепление' : 'Basalt Wool Insulation' },
    { key: 'floorJoists', label: lang === 'ru' ? 'Обвязка и лаги пола' : 'Sill Plate & Floor Joists' },
    { key: 'windows', label: lang === 'ru' ? 'Остекление ПВХ' : 'PVC Glazing Profile' },
    { key: 'door', label: lang === 'ru' ? 'Входная группа' : 'Entrance Door' },
    { key: 'floorFinish', label: lang === 'ru' ? 'Чистовой пол' : 'Finished Flooring' },
    { key: 'roofGift', label: lang === 'ru' ? 'Кровля по акции' : 'Promotional Roofing' },
    { key: 'foundationDiscount', label: lang === 'ru' ? 'Фундамент' : 'Foundation Bonus' },
  ];

  const priceLabel = lang === 'ru' ? 'Базовая стоимость под ключ' : 'Base turnkey price';
  const tempPrefix = lang === 'ru' ? 'Режим эксплуатации' : 'Operating range';

  const selectTier = (id: number) => {
    playUiClick('tap');
    setSelectedTier(id);
  };

  const renderCta = (tier: Tier) => (
    <PackageCta
      tier={tier}
      lang={lang}
      onSelect={(price) => onSelectPackage(price)}
    />
  );

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12 sm:mb-14">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          04 · {lang === 'ru' ? 'Прозрачное сравнение комплектаций' : 'Turnkey Package Comparison'}
        </span>
        <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.03em] text-ink dark:text-cream mt-4 text-balance">
          {lang === 'ru'
            ? 'Выберите комплектацию под ваш режим отдыха или жизни'
            : 'Choose the Insulation Package for Your Lifestyle'}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed max-w-2xl">
          {lang === 'ru'
            ? 'Любой проект из каталога мы строим в одном из трёх тепловых контуров — от летней дачи до зимнего дома ПМЖ.'
            : 'Any model in our catalog can be built in one of three thermal packages.'}
        </p>
      </div>

      {/* Desktop: one comparison table, rows = specs, columns = packages */}
      <div className="hidden md:block rounded-[20px] overflow-hidden border border-ink/15 dark:border-cream/12">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            {lang === 'ru' ? 'Сравнение тепловых комплектаций' : 'Comparison of thermal packages'}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[24%] p-6 align-bottom bg-paper dark:bg-forest-raised">
                <span className="eyebrow text-olive dark:text-cream-soft">
                  {lang === 'ru' ? 'Характеристика' : 'Specification'}
                </span>
              </th>
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <th
                    key={tier.id}
                    scope="col"
                    className={`p-6 align-bottom font-normal ${
                      tier.popular
                        ? 'bg-forest text-cream'
                        : 'bg-paper dark:bg-forest-raised text-ink dark:text-cream'
                    }`}
                  >
                    <span
                      className={`eyebrow block mb-3 ${
                        tier.popular ? 'text-brass-light' : 'text-brass-ink dark:text-brass-light'
                      }`}
                    >
                      {tier.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => selectTier(tier.id)}
                      aria-pressed={isSelected}
                      className="text-left group"
                    >
                      <span className="font-light text-3xl leading-tight block">{tier.name}</span>
                      <span
                        className={`block h-[2px] mt-3 origin-left transition-transform duration-500 ease-out-soft ${
                          tier.popular ? 'bg-brass-light' : 'bg-ink dark:bg-brass-light'
                        } ${isSelected ? 'scale-x-100' : 'scale-x-0'}`}
                        aria-hidden="true"
                      />
                    </button>
                    <span
                      className={`block text-xs mt-3 ${
                        tier.popular ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'
                      }`}
                    >
                      {tempPrefix}: <span className="font-semibold">{tier.temp}</span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* Price row */}
            <tr>
              <th scope="row" className="p-5 text-sm font-normal text-ink-soft dark:text-cream-soft bg-paper dark:bg-forest-raised border-t border-ink/15 dark:border-cream/12">
                {priceLabel}
              </th>
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  className={`p-5 border-t font-light text-3xl tabular-nums ${
                    tier.popular
                      ? 'bg-forest text-cream border-cream/12'
                      : 'bg-paper dark:bg-forest-raised text-ink dark:text-cream border-ink/15 dark:border-cream/12'
                  }`}
                >
                  {tier.priceDisplay}
                </td>
              ))}
            </tr>

            {/* Spec rows */}
            {rowLabels.map((row) => (
              <tr key={row.key}>
                <th scope="row" className="p-5 text-xs font-medium text-olive dark:text-cream-soft bg-paper dark:bg-forest-raised border-t border-ink/12 dark:border-cream/10">
                  {row.label}
                </th>
                {tiers.map((tier) => (
                  <td
                    key={tier.id}
                    className={`p-5 border-t text-sm font-medium ${
                      tier.popular
                        ? 'bg-forest text-cream border-cream/10'
                        : 'bg-paper dark:bg-forest-raised text-ink dark:text-cream border-ink/12 dark:border-cream/10'
                    }`}
                  >
                    {tier.specs[row.key]}
                  </td>
                ))}
              </tr>
            ))}

            {/* CTA row */}
            <tr>
              <th scope="row" className="p-5 bg-paper dark:bg-forest-raised border-t border-ink/15 dark:border-cream/12" />
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  className={`p-5 border-t align-top ${
                    tier.popular
                      ? 'bg-forest border-cream/12'
                      : 'bg-paper dark:bg-forest-raised border-ink/15 dark:border-cream/12'
                  }`}
                >
                  {renderCta(tier)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile: the same data as stacked cards */}
      <div className="md:hidden grid gap-5">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => selectTier(tier.id)}
              className={`rounded-[20px] p-6 border transition-colors cursor-pointer ${
                tier.popular
                  ? 'bg-forest text-cream border-cream/10'
                  : `bg-paper dark:bg-forest-raised ${
                      isSelected
                        ? 'border-ink dark:border-brass-light'
                        : 'border-ink/12 dark:border-cream/10'
                    }`
              }`}
            >
              <span
                className={`eyebrow block mb-3 ${
                  tier.popular ? 'text-brass-light' : 'text-brass-ink dark:text-brass-light'
                }`}
              >
                {tier.badge}
              </span>
              <h3 className="font-light text-3xl leading-tight">{tier.name}</h3>
              <p className={`text-xs mt-2 ${tier.popular ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'}`}>
                {tempPrefix}: <span className="font-semibold">{tier.temp}</span>
              </p>

              <div
                className={`my-5 py-4 border-y ${
                  tier.popular ? 'border-cream/12' : 'border-ink/12 dark:border-cream/10'
                }`}
              >
                <span className={`eyebrow block mb-1 ${tier.popular ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'}`}>
                  {priceLabel}
                </span>
                <span className="font-light text-3xl tabular-nums">{tier.priceDisplay}</span>
              </div>

              <dl className="space-y-3">
                {rowLabels.map((row) => (
                  <div key={row.key}>
                    <dt className={`text-[11px] font-medium ${tier.popular ? 'text-cream-soft' : 'text-olive dark:text-cream-soft'}`}>
                      {row.label}
                    </dt>
                    <dd className="text-sm font-medium">{tier.specs[row.key]}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7">
                {renderCta(tier)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
