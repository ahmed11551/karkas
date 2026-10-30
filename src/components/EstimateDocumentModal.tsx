import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, FileText, Gift } from 'lucide-react';
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

  const estimateNumber = `КП-${config.size}${config.insulation || 10}-${new Date().getDate()}${new Date().getMonth() + 1}`;
  const currentDate = new Date().toLocaleDateString('ru-RU', {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#10201A] text-neutral-900 dark:text-neutral-100 w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#2F5A4B] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="px-6 py-4 bg-[#142E25] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#E6B860]" />
            <div>
              <span className="font-display font-bold text-sm block">
                Персональная смета № {estimateNumber}
              </span>
              <span className="text-[11px] text-emerald-200/80">
                Сформирована {currentDate} · Действует 14 дней
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-3.5 py-2 rounded-xl bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-semibold text-xs flex items-center gap-1.5 transition-all gold-glow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Скачать PDF / Печать</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Official Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Document Header & Company Credentials */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-xl text-[#142E25] dark:text-[#E6B860]">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#E6B860]" />
                <span>{COMPANY_CONFIG.shortBrand[lang]}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]} · Собственное производство с {COMPANY_CONFIG.foundedYear} года ({COMPANY_CONFIG.builtHousesCount} домов)
              </p>
              <p className="text-xs text-neutral-500">
                {COMPANY_CONFIG.address[lang]} · Тел.: {COMPANY_CONFIG.phoneDisplay} · Без предоплаты
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                Оплата 100% после сборки
              </span>
              <p className="text-xs text-neutral-500 mt-1.5">
                Гарантия по договору: {COMPANY_CONFIG.warrantyMonths} месяцев
              </p>
            </div>
          </div>

          {/* Visual Blueprints: Facade + Floor Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-100/80 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Архитектурный фасад
              </span>
              <div className="w-full max-w-[220px] aspect-[200/120]">
                <HouseSvg
                  styleType={config.veranda ? 'glassv' : 'gable'}
                  hasPiles={config.foundation === 1}
                  hasVeranda={config.veranda === 1}
                  viewMode="facade"
                />
              </div>
            </div>
            <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pt-4 sm:pt-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Экспликация помещений ({config.size} м²)
              </span>
              <div className="w-full max-w-[220px] aspect-[200/120]">
                <HouseSvg
                  styleType={config.veranda ? 'glassv' : 'gable'}
                  viewMode="plan"
                />
              </div>
            </div>
          </div>

          {/* Itemized Specification Table */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-neutral-500 mb-3">
              Спецификация работ и материалов
            </h4>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300">
                    <th className="py-3 px-4 font-semibold">Наименование узла / этапа</th>
                    <th className="py-3 px-4 font-semibold">Параметры по ГОСТ</th>
                    <th className="py-3 px-4 font-semibold text-right">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  <tr>
                    <td className="py-3 px-4 font-medium">Домокомплект и силовой каркас</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      Площадь {config.size} м², сухой строганный брус 150×150 и 150×50 мм
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {baseKitPrice.toLocaleString('ru-RU')} ₽
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Теплоизоляционный контур</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      Базальтовая каменная вата {insulationMm} мм + мембраны Ондутис
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {insulationCost === 0 ? 'Включено в базу' : `+${insulationCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Фундаментное основание</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      {config.foundation === 1
                        ? 'Оцинкованные винтовые сваи 2.5 м с оголовками (скидка 50%)'
                        : 'Монтаж на готовый фундамент заказчика'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {foundationCost === 0 ? '0 ₽' : `${foundationCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Панорамная веранда / терраса</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      {config.veranda === 1 ? 'Крытая веранда с чистовым настилом' : 'Без дополнительной веранды'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {verandaCost === 0 ? '0 ₽' : `+${verandaCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Доставка и сборка на участке</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      {distanceKm} км от МКАД, сборка штатной бригадой за 1–3 дня
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {deliveryExtraCost === 0
                        ? '0 ₽ (Подарок)'
                        : `+${deliveryExtraCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Кровля из металлочерепицы</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      Профиль 0.5 мм (цвет графит/изумруд/шоколад на выбор)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      0 ₽ (Подарок)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Stamp Box */}
          <div className="p-5 rounded-2xl bg-[#142E25] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#E6B860] font-semibold">
                <Gift className="w-4 h-4" />
                <span>Зафиксирована выгода по акции: −90 000 ₽ на сваях + кровля в подарок</span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Итоговая стоимость под ключ без скрытых доплат (включая НДС и монтаж):
              </p>
              <p className="text-xs text-emerald-200/70">
                Доступна льготная ипотека от 6% (≈ {monthlyPayment.toLocaleString('ru-RU')} ₽ / мес.)
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs text-emerald-200/80 block">ИТОГО К ОПЛАТЕ ПОСЛЕ СБОРКИ:</span>
              <span className="font-display font-bold text-2xl sm:text-3xl text-[#E6B860] tabular-nums">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {/* CTA Footer inside Document */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Смета заверена главным инженером проекта. Фиксация цены по номеру телефона.</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onLockPrice();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-xs transition-all gold-glow whitespace-nowrap"
            >
              Закрепить эту смету за номером
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
