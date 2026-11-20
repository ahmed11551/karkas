import React, { useEffect, useState, useMemo } from 'react';
import { Truck, Share2, CheckCheck, FileDown, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Language, CalculatorConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CALCULATOR_CONSTANTS, buildMessengerUrl } from '../config/company';
import { HouseSvg } from './HouseSvg';
import { RollingNumber } from './RollingNumber';
import { EstimateDocumentModal } from './EstimateDocumentModal';
import { playUiClick } from '../utils/sound';
import { track } from '../utils/analytics';
import { saveLead, LeadCalculatorParams } from '../utils/leads';
import { SuccessNotice } from './SuccessNotice';
import { formatRussianPhoneInput, validateRussianPhone } from '../utils/phoneValidation';
import { ConsentField } from './ConsentField';

const {
  BASE_PRICE_THOUSANDS,
  PRICE_PER_SQM_THOUSANDS,
  PILES_FOUNDATION_PRICE_THOUSANDS,
  VERANDA_PRICE_THOUSANDS,
  FREE_DELIVERY_RADIUS_KM,
  EXTRA_DELIVERY_RUB_PER_KM,
} = CALCULATOR_CONSTANTS;

interface InteractiveCalculatorProps {
  lang: Language;
  onOpenQuiz: (prefilledPrice?: number, calcParams?: LeadCalculatorParams, houseTitle?: string) => void;
  isNightScene: boolean;
}

/** Option button in the spec sheet: ink fill when selected, hairline otherwise. */
const optionClass = (active: boolean): string =>
  `px-3 py-3 rounded-[10px] text-xs sm:text-sm font-medium border text-center transition-colors duration-300 ${
    active
      ? 'bg-ink text-paper border-ink dark:bg-cream dark:text-forest dark:border-cream'
      : 'bg-transparent text-ink-soft border-ink/15 hover:border-ink/50 hover:text-ink dark:text-cream-soft dark:border-cream/15 dark:hover:border-cream/50 dark:hover:text-cream'
  }`;

/** Numbered group header, spec-sheet style. */
const SpecGroup: React.FC<{
  index: string;
  label: string;
  value?: React.ReactNode;
  children: React.ReactNode;
}> = ({ index, label, value, children }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3 mb-3 pb-2 border-b border-ink/12 dark:border-cream/10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs tracking-[0.04em] text-olive dark:text-cream-soft">{index}</span>
        <span className="eyebrow text-ink dark:text-cream">{label}</span>
      </div>
      {value !== undefined && (
        <span className="font-mono text-xs font-semibold text-brass-ink dark:text-brass-light tabular-nums">
          {value}
        </span>
      )}
    </div>
    {children}
  </div>
);

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
  const [calcPhone, setCalcPhone] = useState<string>('');
  const [calcPhoneError, setCalcPhoneError] = useState<string>('');
  const [calcConsent, setCalcConsent] = useState(false);
  const [calcConsentError, setCalcConsentError] = useState('');
  const [calcLockedSuccess, setCalcLockedSuccess] = useState<boolean>(false);
  const calcStarted = React.useRef(false);
  const markCalcStart = () => {
    if (calcStarted.current) return;
    calcStarted.current = true;
    track('calc_start');
  };

  // Delivery cost calculation (Free up to 100km, then 50₽/km)
  const deliveryExtraCost = useMemo(() => {
    if (distanceKm <= FREE_DELIVERY_RADIUS_KM) return 0;
    return (distanceKm - FREE_DELIVERY_RADIUS_KM) * EXTRA_DELIVERY_RUB_PER_KM;
  }, [distanceKm]);

  // Calculate total price using the original exact math formula + delivery
  const totalPriceInThousands = useMemo(() => {
    const base = BASE_PRICE_THOUSANDS;
    const sizePart = PRICE_PER_SQM_THOUSANDS * config.size;
    const insulationPart = config.insulation;
    const foundationPart = config.foundation ? PILES_FOUNDATION_PRICE_THOUSANDS : 0;
    const verandaPart = config.veranda ? VERANDA_PRICE_THOUSANDS : 0;
    return Math.round(base + sizePart + insulationPart + foundationPart + verandaPart);
  }, [config.size, config.insulation, config.foundation, config.veranda]);

  const totalPrice = totalPriceInThousands * 1000 + deliveryExtraCost;

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

  const insulationLabel = config.insulation === 0 ? '100 мм' : config.insulation === 35 ? '150 мм' : '200 мм';

  useEffect(() => {
    markCalcStart();
  }, [config.size, config.insulation, config.foundation, config.veranda, distanceKm]);

  return (
    <section id="calculator" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
        <div className="max-w-2xl">
          <span className="eyebrow text-brass-ink dark:text-brass-light">
            03 · {lang === 'ru' ? 'Конфигуратор за 1 минуту' : '1-Minute Estimator'}
          </span>
          <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.03em] text-ink dark:text-cream mt-4 text-balance">
            {t.calculator.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed">
            {t.calculator.subtitle}
          </p>
        </div>
      </div>

      {/* One panel: spec sheet on paper, price card on forest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[20px] overflow-hidden border border-ink/15 dark:border-cream/12">
        {/* Left: spec options */}
        <div className="lg:col-span-7 bg-paper dark:bg-forest-raised p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-9">
          {/* Group 1: House Size */}
          <SpecGroup index="01" label={t.calculator.houseSize} value={`${config.size} м²`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {t.calculator.sizes.map((s) => (
                <button
                  key={s.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, size: s.val }));
                  }}
                  className={optionClass(config.size === s.val)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </SpecGroup>

          {/* Group 2: Insulation */}
          <SpecGroup index="02" label={t.calculator.insulation} value={insulationLabel}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {t.calculator.insulations.map((ins) => (
                <button
                  key={ins.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, insulation: ins.val }));
                  }}
                  className={optionClass(config.insulation === ins.val)}
                >
                  {ins.label}
                </button>
              ))}
            </div>
          </SpecGroup>

          {/* Group 3: Foundation */}
          <SpecGroup
            index="03"
            label={t.calculator.foundation}
            value={config.foundation === 1 ? '−50% акция' : '0 ₽'}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {t.calculator.foundations.map((f) => (
                <button
                  key={f.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, foundation: f.val }));
                  }}
                  className={optionClass(config.foundation === f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SpecGroup>

          {/* Group 4: Veranda / Terrace */}
          <SpecGroup
            index="04"
            label={t.calculator.veranda}
            value={config.veranda === 1 ? '+60 000 ₽' : '0 ₽'}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {t.calculator.verandas.map((v) => (
                <button
                  key={v.val}
                  onClick={() => {
                    playUiClick('tick');
                    setConfig((prev) => ({ ...prev, veranda: v.val }));
                  }}
                  className={optionClass(config.veranda === v.val)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </SpecGroup>

          {/* Group 5: Delivery Distance from MKAD */}
          <div className="p-4 rounded-[12px] border border-ink/12 dark:border-cream/10 space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink dark:text-cream">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brass-ink dark:text-brass-light shrink-0" />
                {lang === 'ru'
                  ? `Расстояние до участка от МКАД: ${distanceKm} км`
                  : `Distance from MKAD: ${distanceKm} km`}
              </span>
              <span className="font-mono text-brass-ink dark:text-brass-light whitespace-nowrap">
                {distanceKm <= FREE_DELIVERY_RADIUS_KM
                  ? lang === 'ru'
                    ? '0 ₽ (Бесплатно)'
                    : '0 ₽ (Free)'
                  : `+${deliveryExtraCost.toLocaleString('ru-RU')} ₽`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={distanceKm}
              aria-label={lang === 'ru' ? 'Расстояние от МКАД' : 'Distance from MKAD'}
              onChange={(e) => {
                playUiClick('tick');
                setDistanceKm(+e.target.value);
              }}
              className="w-full accent-[#006434] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-olive dark:text-cream-soft">
              <span>{lang === 'ru' ? '0 км (МКАД)' : '0 km (MKAD)'}</span>
              <span className="font-semibold text-brass-ink dark:text-brass-light">
                {lang === 'ru' ? 'до 500 км бесплатно' : 'free up to 500 km'}
              </span>
              <span>500 км</span>
            </div>
          </div>
        </div>

        {/* Right: live preview & price on forest */}
        <div className="lg:col-span-5 relative overflow-hidden bg-forest text-cream p-7 sm:p-9 lg:p-10 flex flex-col justify-between gap-7">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(120% 70% at 100% 0%, rgba(224,194,127,0.10), transparent 60%)',
            }}
            aria-hidden="true"
          />

          {/* Visual Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow text-brass-light">{t.calculator.previewHeader}</span>
              <span className="font-mono text-xs text-cream-soft tabular-nums">{config.size} м²</span>
            </div>

            {/* Dynamic SVG House Rendering */}
            <div className="my-4 max-w-[280px] mx-auto aspect-[200/120] flex items-center justify-center">
              <HouseSvg
                lang={lang}
                styleType={config.veranda ? 'glassv' : 'gable'}
                isNight={isNightScene}
                hasPiles={config.foundation === 1}
                hasVeranda={config.veranda === 1}
                scale={previewScale}
                className="w-full h-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Price Numbers & Breakdown */}
          <div className="relative z-10 space-y-5">
            <div>
              <span className="eyebrow block text-cream-soft mb-2">
                {lang === 'ru' ? 'Итого под ключ' : 'Total turnkey'}
              </span>
              <RollingNumber
                value={totalPrice}
                prefix="≈ "
                suffix=" ₽"
                font="font-light"
                className="text-5xl sm:text-6xl leading-none text-cream"
              />
            </div>

            <dl className="text-sm border-t border-cream/15">
              {[
                [lang === 'ru' ? 'Дом' : 'House', (BASE_PRICE_THOUSANDS + PRICE_PER_SQM_THOUSANDS * config.size) * 1000],
                [lang === 'ru' ? 'Утепление' : 'Insulation', config.insulation * 1000],
                [lang === 'ru' ? 'Фундамент' : 'Foundation', (config.foundation ? PILES_FOUNDATION_PRICE_THOUSANDS : 0) * 1000],
                [lang === 'ru' ? 'Веранда' : 'Veranda', (config.veranda ? VERANDA_PRICE_THOUSANDS : 0) * 1000],
                [lang === 'ru' ? 'Доставка' : 'Delivery', deliveryExtraCost],
              ].map(([label, amount]) => (
                <div key={String(label)} className="flex justify-between gap-4 py-2 border-b border-cream/10">
                  <dt className="text-cream-soft">{label}</dt>
                  <dd className="tabular-nums">{Number(amount).toLocaleString('ru-RU')} ₽</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-cream-soft leading-relaxed">{t.calculator.paymentAfterText} {t.calculator.giftRoofText}</p>

            <div className="p-4 rounded-[12px] border border-brass-light/30 text-sm text-brass-light leading-relaxed">
              {config.foundation === 1
                ? t.calculator.saveTextWithPiles
                : t.calculator.saveTextWithoutPiles}
            </div>

            {/* Strictly Validated Phone Input + Buttons: Lock In, Download PDF Estimate, Share */}
            <div className="space-y-3 pt-1">
              {calcLockedSuccess ? (
                <div className="p-4 sm:p-5 rounded-[12px] border border-cream/20 bg-forest-raised/60 space-y-4 text-cream">
                  <SuccessNotice
                    tone="dark"
                    title={lang === 'ru' ? 'Цена закреплена' : 'Price locked'}
                    text={
                      lang === 'ru'
                        ? `${totalPrice.toLocaleString('ru-RU')} ₽ за ${calcPhone}. Перезвоним, чтобы уточнить участок, и пришлём смету в мессенджер.`
                        : `${totalPrice.toLocaleString('ru-RU')} ₽ for ${calcPhone}. We will call to confirm the plot and send the estimate by messenger.`
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setCalcLockedSuccess(false)}
                      className="text-xs underline text-brass-light hover:text-cream transition-colors"
                    >
                      {lang === 'ru' ? 'Изменить телефон' : 'Change phone'}
                    </button>
                  </SuccessNotice>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={buildMessengerUrl(
                        'whatsapp',
                        `Здравствуйте! Зафиксировал в калькуляторе дом ${config.size} м² на сумму ${totalPrice.toLocaleString('ru-RU')} ₽ (тел. ${calcPhone}). Пришлите детальную смету.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={buildMessengerUrl(
                        'telegram',
                        `Здравствуйте! Зафиксировал в калькуляторе дом ${config.size} м² на сумму ${totalPrice.toLocaleString('ru-RU')} ₽ (тел. ${calcPhone}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] bg-[#229ED9] hover:bg-[#1C88BD] text-white font-semibold text-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="calc-phone" className="sr-only">
                    {lang === 'ru' ? 'Номер телефона для фиксации сметы' : 'Phone number to lock the estimate'}
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    value={calcPhone}
                    onChange={(e) => {
                      setCalcPhone(formatRussianPhoneInput(e.target.value));
                      if (calcPhoneError) setCalcPhoneError('');
                    }}
                    placeholder={
                      lang === 'ru'
                        ? 'Ваш телефон: +7 (9__) ___-__-__'
                        : 'Your phone: +7 (9__) ___-__-__'
                    }
                    id="calc-phone"
                    aria-invalid={Boolean(calcPhoneError)}
                    aria-describedby={calcPhoneError ? 'calc-phone-error' : undefined}
                    className={`w-full h-12 px-4 rounded-[12px] bg-cream text-forest placeholder:text-olive font-medium text-base focus:outline-none focus:ring-2 transition-all ${
                      calcPhoneError ? 'ring-2 ring-rose-400 bg-rose-50' : 'focus:ring-brass-light'
                    }`}
                  />
                  {calcPhoneError && (
                    <p
                      id="calc-phone-error"
                      role="alert"
                      className="text-xs text-rose-300 px-3 font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{calcPhoneError}</span>
                    </p>
                  )}
                  <ConsentField
                    id="calc-consent"
                    lang={lang}
                    tone="dark"
                    checked={calcConsent}
                    error={calcConsentError}
                    onChange={(checked) => {
                      setCalcConsent(checked);
                      if (checked) setCalcConsentError('');
                    }}
                    className="px-1 text-cream-soft"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  const calcParams: LeadCalculatorParams = {
                    size: config.size,
                    insulation:
                      config.insulation === 0
                        ? '100 мм (Лето)'
                        : config.insulation === 35
                          ? '150 мм (Осень-Зима)'
                          : '200 мм (Арктика ПМЖ)',
                    foundation:
                      config.foundation === 1
                        ? 'Свайно-винтовой (−50% акция)'
                        : 'На готовый фундамент (0 ₽)',
                    veranda:
                      config.veranda === 1
                        ? 'С террасой / верандой (+60 000 ₽)'
                        : 'Без веранды',
                    distanceKm,
                    mortgageMode: false,
                  };
                  const title = `Каркасный дом ${config.size} м²${config.veranda ? ' с верандой' : ''}`;

                  // If user typed anything in the calculator phone box (or clicked lock), validate strictly
                  if (calcPhone.trim().length > 0) {
                    const validation = validateRussianPhone(calcPhone, lang);
                    if (!validation.isValid) {
                      playUiClick('tick');
                      setCalcPhoneError(
                        validation.error ||
                          (lang === 'ru'
                            ? 'Введите корректный номер телефона для фиксации сметы.'
                            : 'Enter a valid phone number to lock the estimate.')
                      );
                      return;
                    }
                    if (!calcConsent) {
                      playUiClick('tick');
                      setCalcConsentError(
                        lang === 'ru'
                          ? 'Подтвердите согласие на обработку персональных данных.'
                          : 'Please confirm consent to process your personal data.'
                      );
                      return;
                    }

                    const result = await saveLead({
                      source: 'calculator',
                      clientName: '',
                      phone: validation.normalized || calcPhone,
                      houseTitle: title,
                      calculatedPrice: totalPrice,
                      calculatorParams: calcParams,
                      giftsSelected: [
                        'Металлочерепица 0 ₽',
                        config.foundation === 1 ? 'Сваи −50%' : 'Доставка до 500 км 0 ₽',
                      ],
                      consent: true,
                    });
                    if (!result.ok) {
                      playUiClick('tick');
                      setCalcPhoneError(
                        result.error ||
                          (lang === 'ru' ? 'Не удалось закрепить заявку.' : 'Could not save the request.')
                      );
                      return;
                    }
                    playUiClick('success');
                    track('calc_complete', { price: totalPrice });
                    setCalcLockedSuccess(true);
                    setCalcPhoneError('');
                    return;
                  }

                  // If phone input is empty, show validation prompt or let them pass quiz
                  playUiClick('tick');
                  setCalcPhoneError(
                    lang === 'ru'
                      ? 'Укажите реальный номер телефона выше, чтобы закрепить расчёт в смете.'
                      : 'Please enter a valid phone number above to lock this price.'
                  );
                }}
                className="w-full py-4 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-medium text-sm transition-colors text-center active:scale-[0.98]"
              >
                {t.calculator.lockPriceBtn}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playUiClick('tap');
                    setIsEstimateModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-[12px] border border-cream/25 hover:bg-cream/10 text-cream text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-brass-light shrink-0" />
                  <span>{lang === 'ru' ? 'Скачать PDF-смету' : 'Download PDF Quote'}</span>
                </button>

                <button
                  onClick={handleShareEstimate}
                  className="w-full py-2.5 px-3 rounded-[12px] border border-cream/25 hover:bg-cream/10 text-cream text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedShare ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-brass-light shrink-0" />
                      <span>{lang === 'ru' ? 'Скопировано!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-brass-light shrink-0" />
                      <span>{lang === 'ru' ? 'Копировать ссылку' : 'Copy Estimate'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-3 z-30 mt-4 rounded-[12px] bg-forest text-cream px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-cream-soft">{lang === 'ru' ? 'Итого' : 'Total'}</span>
        <span className="font-light text-2xl tabular-nums">≈ {totalPrice.toLocaleString('ru-RU')} ₽</span>
      </div>

      {/* Official Printable PDF Estimate Modal */}
      <EstimateDocumentModal
        isOpen={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        config={config}
        distanceKm={distanceKm}
        totalPrice={totalPrice}
        deliveryExtraCost={deliveryExtraCost}
        lang={lang}
        onLockPrice={() => onOpenQuiz(totalPrice)}
      />
    </section>
  );
};
