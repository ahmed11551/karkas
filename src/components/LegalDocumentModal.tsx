import React from 'react';
import { X, ShieldCheck, FileText, Building2, Mail, Phone } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_CONFIG } from '../config/company';
import { playUiClick } from '../utils/sound';

export type LegalDocType = 'privacy' | 'terms';

interface LegalDocumentModalProps {
  isOpen: boolean;
  docType: LegalDocType;
  lang: Language;
  onClose: () => void;
  onSwitchDoc: (type: LegalDocType) => void;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  docType,
  lang,
  onClose,
  onSwitchDoc,
}) => {
  if (!isOpen) return null;

  const isPrivacy = docType === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#10201A] text-neutral-900 dark:text-neutral-100 w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#2F5A4B] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#142E25] text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {isPrivacy ? (
              <ShieldCheck className="w-5 h-5 text-[#E6B860] shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-[#E6B860] shrink-0" />
            )}
            <div>
              <span className="font-display font-bold text-sm sm:text-base block">
                {isPrivacy
                  ? lang === 'ru'
                    ? 'Политика обработки персональных данных'
                    : 'Privacy & Personal Data Policy'
                  : lang === 'ru'
                    ? 'Пользовательское соглашение и публичная оферта'
                    : 'Terms of Service & Public Offer'}
              </span>
              <span className="text-[11px] text-emerald-200/80">
                {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/25 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onSwitchDoc('privacy');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isPrivacy
                    ? 'bg-[#E6B860] text-[#1E1705]'
                    : 'text-emerald-100/80 hover:text-white'
                }`}
              >
                {lang === 'ru' ? 'Политика (ФЗ-152)' : 'Privacy'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onSwitchDoc('terms');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  !isPrivacy
                    ? 'bg-[#E6B860] text-[#1E1705]'
                    : 'text-emerald-100/80 hover:text-white'
                }`}
              >
                {lang === 'ru' ? 'Соглашение' : 'Terms'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {isPrivacy ? (
            <>
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {lang === 'ru'
                    ? 'Оператор персональных данных:'
                    : 'Personal Data Controller:'}
                </div>
                <div>
                  {COMPANY_CONFIG.legalName[lang]} ({COMPANY_CONFIG.regDetails[lang]})
                </div>
                <div>
                  {lang === 'ru' ? 'Юридический адрес: ' : 'Registered Address: '}
                  {COMPANY_CONFIG.address[lang]}
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru' ? '1. Общие положения' : '1. General Provisions'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? `Настоящая Политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки и меры по обеспечению безопасности персональных данных, предпринимаемые ${COMPANY_CONFIG.legalName.ru} (далее — Оператор).`
                    : `This Privacy Policy outlines how ${COMPANY_CONFIG.legalName.en} collects, processes, and protects personal data submitted by users through the interactive calculator, quiz, and consultation forms.`}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '2. Состав обрабатываемых данных'
                    : '2. Scope of Collected Data'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? 'Оператор обрабатывает следующие данные, добровольно предоставляемые Пользователем при заполнении форм расчёта стоимости, квиза и заказа обратного звонка:'
                    : 'We process the following information voluntarily provided by the User when requesting an estimate or callback:'}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {lang === 'ru'
                      ? 'Контактный номер телефона для связи и отправки сметы в мессенджер;'
                      : 'Contact phone number for consultation and sending the itemized quote;'}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Имя (при указании в форме обращения);'
                      : 'First name (if provided in the form);'}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Выбранные параметры домокомплекта (площадь, толщина утепления, тип фундамента, расстояние доставки от МКАД);'
                      : 'Selected house configuration parameters (area, insulation thickness, foundation type, delivery distance);'}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Технические параметры сессии и UTM-метки рекламного источника.'
                      : 'Technical session attributes and marketing UTM parameters.'}
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '3. Цели обработки персональных данных'
                    : '3. Purpose of Processing'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? 'Персональные данные используются исключительно для подготовки инженерно-сметного расчёта стоимости строительства каркасного дома, фиксации акционных подарков за номером клиента, консультации по условиям договора подряда и льготной ипотеки.'
                    : 'Personal data is used strictly to prepare an accurate construction estimate, reserve promotional gifts for the client phone number, and provide engineering consultation.'}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '4. Защита и хранение информации'
                    : '4. Security & Data Retention'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? `Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного доступа. Передача данных третьим лицам не осуществляется, за исключением случаев, прямо предусмотренных законодательством РФ. Отзыв согласия возможен путём направления письменного запроса на электронную почту ${COMPANY_CONFIG.email}.`
                    : `We implement strict organizational and technical safeguards to protect personal information. Data is never sold or shared with unauthorized third parties. You may request deletion of your data at any time by contacting ${COMPANY_CONFIG.email}.`}
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {lang === 'ru'
                    ? 'Информация о подрядчике:'
                    : 'Contractor Information:'}
                </div>
                <div>
                  {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]}
                </div>
                <div>
                  {lang === 'ru' ? 'Производственная база: ' : 'Manufacturing Facility: '}
                  {COMPANY_CONFIG.factoryAddress[lang]}
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru' ? '1. Предмет соглашения' : '1. Subject of Agreement'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? `Настоящее Пользовательское соглашение регулирует порядок использования интерактивного сервиса расчёта стоимости и каталога проектов компании ${COMPANY_CONFIG.legalName.ru}. Использование калькулятора и отправка заявки означает согласие Пользователя с условиями настоящего документа.`
                    : `These Terms of Service govern the use of the interactive house configurator and project catalog operated by ${COMPANY_CONFIG.legalName.en}.`}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '2. Расчёт стоимости и фиксация комплектации'
                    : '2. Price Calculation & Estimate Validity'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? 'Предварительный расчёт в онлайн-конфигураторе и сформированная PDF-смета фиксируют базовую стоимость домокомплекта, выбранного контура утепления (100 / 150 / 200 мм), свайно-винтового фундамента и доставки на 14 календарных дней с момента регистрации заявки.'
                    : 'The preliminary quote generated in the online configurator and downloadable PDF estimate lock the base cost of the house kit, selected insulation package, screw-pile foundation, and delivery for 14 calendar days.'}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '3. Порядок оплаты и гарантийные обязательства'
                    : '3. Payment Terms & Structural Warranty'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? `Строительство осуществляется по официальному договору подряда без предоплаты за домокомплект. Оплата 100% производится после завершения монтажа на участке Заказчика и подписания акта приёмки выполненных работ. Гарантийный срок по договору составляет ${COMPANY_CONFIG.warrantyMonths} месяцев.`
                    : `Construction is carried out under an official turnkey contract with zero prepayment. Full settlement takes place after on-site assembly and signing of the acceptance certificate. All houses include a ${COMPANY_CONFIG.warrantyMonths}-month structural warranty.`}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                  {lang === 'ru'
                    ? '4. Авторские права на проекты'
                    : '4. Intellectual Property'}
                </h4>
                <p>
                  {lang === 'ru'
                    ? 'Все представленные на сайте архитектурные планировки, 3D-разрезы конструкций, сметные калькуляции и визуальные материалы являются интеллектуальной собственностью ООО «Каркасник».'
                    : 'All architectural floorplans, 3D structural cutaways, and engineering specifications on this website are the intellectual property of Karkasnik LLC.'}
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 bg-neutral-100 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>{COMPANY_CONFIG.legalName[lang]}</span>
            </span>
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="inline-flex items-center gap-1.5 hover:text-[#B27D18] dark:hover:text-[#E6B860]"
            >
              <Phone className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>{COMPANY_CONFIG.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${COMPANY_CONFIG.email}`}
              className="inline-flex items-center gap-1.5 hover:text-[#B27D18] dark:hover:text-[#E6B860]"
            >
              <Mail className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>{COMPANY_CONFIG.email}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              playUiClick('tap');
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-xs transition-all gold-glow self-end sm:self-auto"
          >
            {lang === 'ru' ? 'Понятно, закрыть' : 'Close Document'}
          </button>
        </div>
      </div>
    </div>
  );
};
