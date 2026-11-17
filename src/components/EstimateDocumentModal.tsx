import React from 'react';
import { X, Printer, ShieldCheck, FileText, Gift } from 'lucide-react';
import { CalculatorConfig, Language } from '../types';
import { COMPANY_CONFIG, CALCULATOR_CONSTANTS } from '../config/company';
import { HouseSvg } from './HouseSvg';
import { playUiClick } from '../utils/sound';

interface EstimateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CalculatorConfig;
  distanceKm: number;
  totalPrice: number;
  deliveryExtraCost: number;
  monthlyPayment: number;
  lang: Language;
  onLockPrice: () => void;
}

export const EstimateDocumentModal: React.FC<EstimateDocumentModalProps> = ({
  isOpen,
  onClose,
  config,
  distanceKm,
  totalPrice,
  deliveryExtraCost,
  monthlyPayment,
  lang,
  onLockPrice,
}) => {
  if (!isOpen) return null;

  const tx = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  const estimateNumber = `КП-${config.size}${config.insulation || 10}-${new Date().getDate()}${new Date().getMonth() + 1}`;
  const currentDate = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const insulationMm = config.insulation === 0 ? 100 : config.insulation === 35 ? 150 : 200;
  const baseKitPrice =
    (CALCULATOR_CONSTANTS.BASE_PRICE_THOUSANDS +
      CALCULATOR_CONSTANTS.PRICE_PER_SQM_THOUSANDS * config.size) *
    1000;
  const insulationCost = config.insulation * 1000;
  const foundationCost = config.foundation
    ? CALCULATOR_CONSTANTS.PILES_FOUNDATION_PRICE_THOUSANDS * 1000
    : 0;
  const verandaCost = config.veranda
    ? CALCULATOR_CONSTANTS.VERANDA_PRICE_THOUSANDS * 1000
    : 0;

  const handlePrintPdf = () => {
    playUiClick('tap');
    window.print();
  };

  // Document sheet: paper in both themes, so the printed view and the modal look the same.
  const cellMuted = 'py-3 px-4 text-olive';
  const cellPrice = 'py-3 px-4 text-right font-mono font-semibold tabular-nums text-ink';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tx('Персональная смета', 'Personal estimate')}
      data-print-root
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-forest/75  overflow-y-auto"
      onClick={onClose}
    >
      <div
        data-print-area
        className="bg-paper text-ink w-full max-w-3xl rounded-[20px]  border border-ink/15 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-6 py-4 bg-forest text-cream flex items-center justify-between gap-4 border-b border-cream/10">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-brass-light shrink-0" />
            <div className="min-w-0">
              <span className="font-light text-lg block truncate">
                {tx('Персональная смета', 'Personal estimate')} № {estimateNumber}
              </span>
              <span className="text-[11px] text-cream-soft/80">
                {tx(`Сформирована ${currentDate} · Действует 14 дней`, `Issued ${currentDate} · Valid for 14 days`)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3.5 py-2 rounded-[12px] border border-cream/35 text-cream hover:bg-cream hover:text-forest font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tx('Печать / PDF', 'Print / PDF')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-cream/70 hover:text-cream transition-colors"
              aria-label={tx('Закрыть', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document body */}
        <div className="p-6 sm:p-9 overflow-y-auto space-y-8">
          {/* Document header & company credentials */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-ink/15">
            <div>
              <div className="flex items-center gap-2.5 font-light text-2xl text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-brass" aria-hidden="true" />
                <span>{COMPANY_CONFIG.shortBrand[lang]}</span>
              </div>
              <p className="text-xs text-olive mt-2">
                {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]} ·{' '}
                {tx(
                  `Собственное производство с ${COMPANY_CONFIG.foundedYear} года (${COMPANY_CONFIG.builtHousesCount} домов)`,
                  `In-house production since ${COMPANY_CONFIG.foundedYear} (${COMPANY_CONFIG.builtHousesCount} houses built)`
                )}
              </p>
              <p className="text-xs text-olive">
                {COMPANY_CONFIG.address[lang]} · {tx('Тел.', 'Tel.')}: {COMPANY_CONFIG.phoneDisplay} ·{' '}
                {tx('Без предоплаты', 'No prepayment')}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block eyebrow px-3 py-1.5 rounded-[12px] border border-ink/25 text-ink">
                {tx('Оплата 100% после сборки', 'Full payment after assembly')}
              </span>
              <p className="text-xs text-olive mt-2">
                {tx(
                  `Гарантия по договору: ${COMPANY_CONFIG.warrantyMonths} месяцев`,
                  `Contract warranty: ${COMPANY_CONFIG.warrantyMonths} months`
                )}
              </p>
            </div>
          </div>

          {/* Facade + floor plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-ink/15 border border-ink/15 rounded-xl overflow-hidden">
            <div className="flex flex-col items-center bg-paper p-5">
              <span className="eyebrow text-olive mb-3">{tx('Архитектурный фасад', 'Architectural facade')}</span>
              <div className="w-full max-w-[220px] aspect-[200/120]">
                <HouseSvg
                  styleType={config.veranda ? 'glassv' : 'gable'}
                  hasPiles={config.foundation === 1}
                  hasVeranda={config.veranda === 1}
                  viewMode="facade"
                  lang={lang}
                />
              </div>
            </div>
            <div className="flex flex-col items-center bg-paper p-5">
              <span className="eyebrow text-olive mb-3">
                {tx(`Экспликация помещений (${config.size} м²)`, `Floor plan (${config.size} m²)`)}
              </span>
              <div className="w-full max-w-[220px] aspect-[200/120]">
                <HouseSvg styleType={config.veranda ? 'glassv' : 'gable'} viewMode="plan" lang={lang} />
              </div>
            </div>
          </div>

          {/* Itemized specification */}
          <div>
            <h4 className="eyebrow text-olive mb-4">{tx('Спецификация работ и материалов', 'Scope of works and materials')}</h4>
            <div className="rounded-xl border border-ink/15 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-ink/15 text-olive">
                    <th className="py-3 px-4 font-semibold">{tx('Наименование узла / этапа', 'Item / stage')}</th>
                    <th className="py-3 px-4 font-semibold">{tx('Параметры по ГОСТ', 'Specification (GOST)')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{tx('Стоимость', 'Amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/12">
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">
                      {tx('Домокомплект и силовой каркас', 'House kit and load-bearing frame')}
                    </td>
                    <td className={cellMuted}>
                      {tx(
                        `Площадь ${config.size} м², сухой строганный брус 150×150 и 150×50 мм`,
                        `Area ${config.size} m², kiln-dried planed timber 150×150 and 150×50 mm`
                      )}
                    </td>
                    <td className={cellPrice}>{baseKitPrice.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">
                      {tx('Теплоизоляционный контур', 'Insulation envelope')}
                    </td>
                    <td className={cellMuted}>
                      {tx(
                        `Базальтовая каменная вата ${insulationMm} мм + мембраны Ондутис`,
                        `Basalt mineral wool ${insulationMm} mm + Ondutis membranes`
                      )}
                    </td>
                    <td className={cellPrice}>
                      {insulationCost === 0
                        ? tx('Включено в базу', 'Included in base price')
                        : `+${insulationCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">{tx('Фундаментное основание', 'Foundation')}</td>
                    <td className={cellMuted}>
                      {config.foundation === 1
                        ? tx(
                            'Оцинкованные винтовые сваи 2.5 м с оголовками (скидка 50%)',
                            'Galvanised screw piles 2.5 m with caps (50% off)'
                          )
                        : tx('Монтаж на готовый фундамент заказчика', 'Assembly on the client\'s existing foundation')}
                    </td>
                    <td className={cellPrice}>
                      {foundationCost === 0 ? '0 ₽' : `${foundationCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">
                      {tx('Панорамная веранда / терраса', 'Panoramic veranda / terrace')}
                    </td>
                    <td className={cellMuted}>
                      {config.veranda === 1
                        ? tx('Крытая веранда с чистовым настилом', 'Covered veranda with finished decking')
                        : tx('Без дополнительной веранды', 'No extra veranda')}
                    </td>
                    <td className={cellPrice}>
                      {verandaCost === 0 ? '0 ₽' : `+${verandaCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">
                      {tx('Доставка и сборка на участке', 'Delivery and assembly on site')}
                    </td>
                    <td className={cellMuted}>
                      {tx(
                        `${distanceKm} км от МКАД, сборка штатной бригадой за 1–3 дня`,
                        `${distanceKm} km from the MKAD, assembled by our crew in 1–3 days`
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-brass-ink">
                      {deliveryExtraCost === 0
                        ? tx('0 ₽ (Подарок)', '₽0 (gift)')
                        : `+${deliveryExtraCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-ink">
                      {tx('Кровля из металлочерепицы', 'Metal tile roof')}
                    </td>
                    <td className={cellMuted}>
                      {tx(
                        'Профиль 0.5 мм (цвет графит/изумруд/шоколад на выбор)',
                        'Profile 0.5 mm (graphite, emerald or chocolate colour)'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-brass-ink">
                      {tx('0 ₽ (Подарок)', '₽0 (gift)')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 rounded-xl bg-forest text-cream flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-brass-light font-semibold">
                <Gift className="w-4 h-4" />
                <span>
                  {tx(
                    'Зафиксирована выгода по акции: −90 000 ₽ на сваях + кровля в подарок',
                    'Promotion saving locked in: −90,000 ₽ on piles + roof as a gift'
                  )}
                </span>
              </div>
              <p className="text-xs text-cream-soft leading-relaxed">
                {tx(
                  'Итоговая стоимость под ключ без скрытых доплат (включая НДС и монтаж):',
                  'Turnkey total with no hidden extras (incl. VAT and assembly):'
                )}
              </p>
              <p className="text-xs text-cream-soft/70">
                {tx(
                  `Доступна льготная ипотека от 6% (≈ ${monthlyPayment.toLocaleString('ru-RU')} ₽ / мес.)`,
                  `Preferential mortgage from 6% available (≈ ${monthlyPayment.toLocaleString('ru-RU')} ₽ / month)`
                )}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="eyebrow block text-cream-soft/80 mb-1">
                {tx('Итого к оплате после сборки', 'Total payable after assembly')}
              </span>
              <span className="font-light text-4xl sm:text-5xl text-brass-light tabular-nums leading-none">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {/* CTA footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-1">
            <div className="flex items-center gap-2 text-xs text-olive">
              <ShieldCheck className="w-4 h-4 text-brass-ink shrink-0" />
              <span>
                {tx(
                  'Смета заверена главным инженером проекта. Фиксация цены по номеру телефона.',
                  'Estimate certified by the chief engineer. The price is locked to your phone number.'
                )}
              </span>
            </div>

            {/* The one gold CTA of the document */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockPrice();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-semibold text-sm transition-all whitespace-nowrap"
            >
              {tx('Закрепить эту смету за номером', 'Lock this estimate to my number')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
