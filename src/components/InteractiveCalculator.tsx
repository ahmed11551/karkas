import React, { useState, useMemo } from 'react';
import { CreditCard, ShieldCheck, Truck, Share2, CheckCheck, FileDown } from 'lucide-react';
import { Language, CalculatorConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HouseSvg } from './HouseSvg';
import { RollingNumber } from './RollingNumber';
import { EstimateDocumentModal } from './EstimateDocumentModal';
import { playUiClick } from '../utils/sound';

interface InteractiveCalculatorProps {
  lang: Language;
  onOpenQuiz: (prefilledPrice?: number) => void;
  isNightScene: boolean;
}

export const InteractiveCalculator: React.FC<InteractiveCalculatorProps> = ({
  lang,
  onOpenQuiz,
  isNightScene,
}) => {
  const t = TRANSLATIONS[lang];

  const [config, setConfig] = useState<CalculatorConfig>({
    size: 36, // 36 m² default
    insulation: 35, // 150 mm default
    foundation: 1, // Screw piles with 50% discount
    veranda: 0, // Without veranda
    mortgageMode: false,
    downPaymentPercent: 20, // 20% down
    mortgageYears: 10, // 10 years
  });

  const [distanceKm, setDistanceKm] = useState<number>(45); // Plot distance from MKAD
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState<boolean>(false);

  // Delivery cost calculation (Free up to 100km, then 50₽/km)
  const deliveryExtraCost = useMemo(() => {
    if (distanceKm <= 100) return 0;
    return (distanceKm - 100) * 50;
  }, [distanceKm]);

  // Calculate total price using the original exact math formula + delivery
  const totalPriceInThousands = useMemo(() => {
    const base = 420;
    const sizePart = 4.5 * config.size;
    const insulationPart = config.insulation;
    const foundationPart = config.foundation ? 90 : 0;
    const verandaPart = config.veranda ? 60 : 0;
    return Math.round(base + sizePart + insulationPart + foundationPart + verandaPart);
  }, [config.size, config.insulation, config.foundation, config.veranda]);

  const totalPrice = totalPriceInThousands * 1000 + deliveryExtraCost;

  // Mortgage calculations
  const downPaymentAmount = Math.round((totalPrice * config.downPaymentPercent) / 100);
  const loanPrincipal = totalPrice - downPaymentAmount;
  const annualInterestRate = 0.06; // 6% preferential mortgage
  const monthlyInterestRate = annualInterestRate / 12;
  const totalMonths = config.mortgageYears * 12;

  const monthlyPayment = useMemo(() => {
    if (loanPrincipal <= 0) return 0;
    const factor = Math.pow(1 + monthlyInterestRate, totalMonths);
    const payment = loanPrincipal * ((monthlyInterestRate * factor) / (factor - 1));
    return Math.round(payment);
  }, [loanPrincipal, monthlyInterestRate, totalMonths]);

  // Preview house scale based on footprint
  const previewScale = useMemo(() => {
    switch (config.size) {
      case 16:
        return 0.85;
      case 36:
        return 1.0;
      case 48:
        return 1.12;
      case 54:
        return 1.2;
      default:
        return 1.0;
    }
  }, [config.size]);

  const handleShareEstimate = () => {
    playUiClick('tick');
    const text = `Каркасник: Дом ${config.size}м² с утеплением ${
      config.insulation === 0 ? '100мм' : config.insulation === 35 ? '150мм' : '200мм'
    }${config.veranda ? ' + веранда' : ''}. Смета: ${totalPrice.toLocaleString('ru-RU')} ₽. Подробнее: ${window.location.href}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <section id="calculator" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
            {lang === 'ru' ? 'Конфигуратор за 1 минуту' : '1-Minute Estimator'}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
            {t.calculator.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Cash vs Mortgage Mode Switch */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur-md self-start md:self-auto">
          <button
            onClick={() => {
              playUiClick('tap');
              setConfig((prev) => ({ ...prev, mortgageMode: false }));
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              !config.mortgageMode
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.calculator.modeCash}</span>
          </button>
          <button
            onClick={() => {
              playUiClick('tap');
              setConfig((prev) => ({ ...prev, mortgageMode: true }));
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              config.mortgageMode
                ? 'bg-white dark:bg-[#183B30] text-[#142E25] dark:text-[#E6B860] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.calculator.modeMortgage}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Calculator Box */}
      <div className="glass-panel rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 lg:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Interactive Options Deck */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-7">
          {/* Group 1: House Size */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {t.calculator.houseSize}
              </span>
              <span className="text-xs font-semibold text-[#B27D18] dark:text-[#E6B860]">
                {config.size} м²
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {t.calculator.sizes.map((s) => (
                <button
                  key={s.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, size: s.val }));
                  }}
                  className={`px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    config.size === s.val
                      ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] shadow-md dark:bg-[#E6B860] dark:text-[#142E25] dark:border-[#E6B860]'
                      : 'bg-white/70 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: Insulation */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {t.calculator.insulation}
              </span>
              <span className="text-xs font-semibold text-[#B27D18] dark:text-[#E6B860]">
                {config.insulation === 0 ? '100 мм' : config.insulation === 35 ? '150 мм' : '200 мм'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {t.calculator.insulations.map((ins) => (
                <button
                  key={ins.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, insulation: ins.val }));
                  }}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    config.insulation === ins.val
                      ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] shadow-md dark:bg-[#E6B860] dark:text-[#142E25] dark:border-[#E6B860]'
                      : 'bg-white/70 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {ins.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Foundation */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {t.calculator.foundation}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {config.foundation === 1 ? '−50% акция' : '0 ₽'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {t.calculator.foundations.map((f) => (
                <button
                  key={f.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, foundation: f.val }));
                  }}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    config.foundation === f.val
                      ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] shadow-md dark:bg-[#E6B860] dark:text-[#142E25] dark:border-[#E6B860]'
                      : 'bg-white/70 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 4: Veranda / Terrace */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {t.calculator.veranda}
              </span>
              <span className="text-xs font-semibold text-[#B27D18] dark:text-[#E6B860]">
                {config.veranda === 1 ? '+60 000 ₽' : '0 ₽'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {t.calculator.verandas.map((v) => (
                <button
                  key={v.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, veranda: v.val }));
                  }}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    config.veranda === v.val
                      ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] shadow-md dark:bg-[#E6B860] dark:text-[#142E25] dark:border-[#E6B860]'
                      : 'bg-white/70 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 5: Delivery Distance from MKAD */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#E6B860]" />
                {lang === 'ru'
                  ? `Расстояние до участка от МКАД: ${distanceKm} км`
                  : `Distance from MKAD: ${distanceKm} km`}
              </span>
              <span className="font-mono text-[#B27D18] dark:text-[#E6B860]">
                {distanceKm <= 100
                  ? lang === 'ru'
                    ? '0 ₽ (Бесплатно)'
                    : '0 ₽ (Free)'
                  : `+${deliveryExtraCost.toLocaleString('ru-RU')} ₽`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={distanceKm}
              onChange={(e) => {
                playUiClick('tick');
                setDistanceKm(+e.target.value);
              }}
              className="w-full accent-[#E6B860] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>0 км (МКАД)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {lang === 'ru' ? 'до 100 км бесплатно' : 'free up to 100 km'}
              </span>
              <span>200 км</span>
            </div>
          </div>

          {/* Mortgage Mode Sub-deck */}
          {config.mortgageMode && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100">
                <span>
                  {t.calculator.downPayment}: {config.downPaymentPercent}%
                </span>
                <span className="font-mono text-[#B27D18] dark:text-[#E6B860]">
                  {downPaymentAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={config.downPaymentPercent}
                onChange={(e) => {
                  playUiClick('tick');
                  setConfig((prev) => ({ ...prev, downPaymentPercent: +e.target.value }));
                }}
                className="w-full accent-[#E6B860] cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100 pt-2">
                <span>
                  {t.calculator.loanTerm}: {config.mortgageYears} лет
                </span>
                <span className="text-neutral-500">{config.mortgageYears * 12} мес.</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={config.mortgageYears}
                onChange={(e) => {
                  playUiClick('tick');
                  setConfig((prev) => ({ ...prev, mortgageYears: +e.target.value }));
                }}
                className="w-full accent-[#E6B860] cursor-pointer"
              />

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t.calculator.rateNotice}
              </p>
            </div>
          )}
        </div>

        {/* Right Live Visualizer & Price Counter Card */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#183B30] via-[#122A21] to-[#0B1A14] text-white p-7 sm:p-8 rounded-3xl border border-[#2F5A4B] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6B860]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Visual Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200/80">
                {t.calculator.previewHeader}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-[#E6B860] font-medium border border-white/15">
                {config.size} м²
              </span>
            </div>

            {/* Dynamic SVG House Rendering */}
            <div className="my-5 max-w-[280px] mx-auto aspect-[200/120] flex items-center justify-center">
              <HouseSvg
                styleType={config.veranda ? 'glassv' : 'gable'}
                isNight={isNightScene}
                hasPiles={config.foundation === 1}
                hasVeranda={config.veranda === 1}
                scale={previewScale}
                className="w-full h-full drop-shadow-md transition-all duration-300"
              />
            </div>
          </div>

          {/* Price Numbers & Breakdown */}
          <div className="relative z-10 space-y-4">
            {config.mortgageMode ? (
              <div>
                <span className="text-xs text-emerald-200/80 block">
                  {t.calculator.monthlyPayment}
                </span>
                <RollingNumber
                  value={monthlyPayment}
                  prefix="≈ "
                  suffix=" ₽ / мес"
                  className="text-3xl sm:text-4xl font-bold text-[#E6B860] my-1"
                />
                <div className="text-xs text-emerald-100/70">
                  Полная стоимость: {totalPrice.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ) : (
              <div>
                <RollingNumber
                  value={totalPrice}
                  prefix="≈ "
                  suffix=" ₽"
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6B860]"
                />
              </div>
            )}

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {t.calculator.breakdownBase} {config.size} м²
              {config.veranda ? ` ${t.calculator.withVerandaText}` : ''}, {t.calculator.paymentAfterText}{' '}
              {t.calculator.giftRoofText}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#E6B860]/15 border border-[#E6B860]/30 text-xs text-[#FDE5B3] leading-relaxed">
              {config.foundation === 1
                ? t.calculator.saveTextWithPiles
                : t.calculator.saveTextWithoutPiles}
            </div>

            {/* Buttons: Lock In, Download PDF Estimate, Share */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  playUiClick('tap');
                  onOpenQuiz(totalPrice);
                }}
                className="w-full py-3.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-sm transition-all gold-glow text-center active:scale-95"
              >
                {t.calculator.lockPriceBtn}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setIsEstimateModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-full bg-white/15 hover:bg-white/25 border border-[#E6B860]/40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#E6B860] shrink-0" />
                  <span>{lang === 'ru' ? 'Скачать PDF-смету' : 'Download PDF Quote'}</span>
                </button>

                <button
                  onClick={handleShareEstimate}
                  className="w-full py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/15 text-emerald-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedShare ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{lang === 'ru' ? 'Скопировано!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#E6B860] shrink-0" />
                      <span>{lang === 'ru' ? 'Копировать ссылку' : 'Copy Estimate'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable PDF Estimate Modal */}
      <EstimateDocumentModal
        isOpen={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        config={config}
        distanceKm={distanceKm}
        totalPrice={totalPrice}
        deliveryExtraCost={deliveryExtraCost}
        monthlyPayment={monthlyPayment}
        lang={lang}
        onLockPrice={() => onOpenQuiz(totalPrice)}
      />
    </section>
  );
};
