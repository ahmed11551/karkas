import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Gift, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Language } from '../types';
import { QUIZ_QUESTIONS, TRANSLATIONS } from '../data/translations';
import { buildMessengerUrl } from '../config/company';
import { saveLead, LeadCalculatorParams } from '../utils/leads';
import { playUiClick } from '../utils/sound';
import { formatRussianPhoneInput, validateRussianPhone } from '../utils/phoneValidation';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  prefilledPrice?: number;
  prefilledCalcParams?: LeadCalculatorParams;
  prefilledHouseTitle?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  lang,
  prefilledPrice,
  prefilledCalcParams,
  prefilledHouseTitle,
}) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [clientName, setClientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({});
      setClientName('');
      setPhone('');
      setPhoneError('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[step];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = ((step + 1) / (totalQuestions + 1)) * 100;

  const handleSelectOption = (opt: string) => {
    playUiClick('tap');
    setAnswers((prev) => ({ ...prev, [step]: opt }));
    if (step < totalQuestions - 1) {
      setStep(step + 1);
    } else {
      setStep(totalQuestions);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRussianPhoneInput(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRussianPhone(phone, lang);
    if (!validation.isValid) {
      playUiClick('tick');
      setPhoneError(
        validation.error ||
          (lang === 'ru'
            ? 'Введите корректный номер телефона, например +7 (916) 482-19-40.'
            : 'Please enter a valid phone number.')
      );
      return;
    }
    saveLead({
      source: 'quiz_modal',
      clientName: clientName.trim() || 'Клиент Квиза',
      phone: validation.normalized || phone,
      houseTitle: prefilledHouseTitle || answers[1] || 'Индивидуальный проект по квизу',
      calculatedPrice: prefilledPrice || 707000,
      calculatorParams: prefilledCalcParams || {
        size: 36,
        insulation: answers[2] || '150 мм (Осень-Зима)',
        foundation: 'Свайно-винтовой (−50% акция)',
        veranda: 'По выбору проекта',
      },
      quizAnswers: answers,
      giftsSelected: [
        'Металлочерепица 0 ₽',
        'Доставка и сборка 0 ₽',
        'Сваи −50%',
        answers[4] || 'Четвертый подарок',
      ],
    });
    playUiClick('success');
    setIsSuccess(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
          aria-label="Закрыть модальное окно"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2 font-medium">
                <span>
                  {step < totalQuestions
                    ? `${lang === 'ru' ? 'Вопрос' : 'Question'} ${step + 1} ${lang === 'ru' ? 'из' : 'of'} ${totalQuestions}`
                    : lang === 'ru'
                    ? 'Финальный шаг'
                    : 'Final Step'}
                </span>
                <span className="font-mono">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-[#E6B860] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Questions Step */}
            {step < totalQuestions && currentQ && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 dark:text-neutral-100">
                    {currentQ.question[lang]}
                  </h3>
                  {currentQ.hint && (
                    <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {currentQ.hint[lang]}
                    </p>
                  )}
                </div>

                <div className="grid gap-2.5 pt-2">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt[lang])}
                      className="w-full text-left p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-[#183B30] dark:hover:border-[#E6B860] bg-white/70 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 transition-all font-medium text-sm text-neutral-800 dark:text-neutral-200 flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span>{opt[lang]}</span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#B27D18] dark:group-hover:text-[#E6B860] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Final Phone Lead Capture Step */}
            {step === totalQuestions && (
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6B860]/20 text-[#B27D18] dark:text-[#E6B860] text-xs font-semibold mb-2">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? '4 подарка закреплены' : '4 Gifts Reserved'}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 dark:text-neutral-100">
                    {lang === 'ru' ? 'Куда прислать точный расчёт?' : 'Where should we send your quote?'}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {lang === 'ru'
                      ? 'Закрепим подарки за этим номером, позвоним для уточнений и пришлём точную смету в мессенджер за 15 минут.'
                      : 'We will lock your gifts, confirm options by phone, and message your turnkey breakdown in 15 minutes.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === 'ru' ? 'Ваше имя (необязательно)' : 'Your name (optional)'}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (9__) ___-__-__"
                    aria-invalid={Boolean(phoneError)}
                    className={`w-full px-5 py-4 rounded-2xl bg-white dark:bg-neutral-900 border text-neutral-900 dark:text-neutral-100 font-display font-medium text-lg focus:outline-none focus:ring-2 shadow-inner ${
                      phoneError
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-neutral-300 dark:border-neutral-700 focus:ring-[#E6B860]'
                    }`}
                    autoFocus
                  />
                  {phoneError && (
                    <p
                      role="alert"
                      className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-sm transition-all gold-glow text-center active:scale-95"
                >
                  {lang === 'ru' ? 'Получить расчёт и подарки' : 'Get Detailed Calculation'}
                </button>

                <p className="text-[11px] text-center text-neutral-400">
                  {lang === 'ru'
                    ? 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных.'
                    : 'By submitting, you agree to the processing of personal data.'}
                </p>
              </form>
            )}
          </>
        ) : (
          /* Confirmation Success View */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
              {lang === 'ru' ? 'Заявка принята!' : 'Inquiry Submitted!'}
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
              {lang === 'ru'
                ? 'Скоро перезвоним, чтобы уточнить детали и участок. Персональный расчёт со скидкой 50% на сваи и бесплатной кровлей придёт в течение 15 минут.'
                : 'Our engineer will call you shortly to confirm plot details. Your custom calculation and seasonal gifts are secured.'}
            </p>

            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-300 text-left space-y-1.5 my-4">
              <span className="font-semibold block text-neutral-900 dark:text-neutral-100">
                {lang === 'ru' ? 'Ваши закрепленные бонусы:' : 'Your locked perks:'}
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                <span>{lang === 'ru' ? 'Металлочерепица в подарок (0 ₽)' : 'Free metal tile roofing (0 ₽)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                <span>{lang === 'ru' ? 'Бесплатная доставка до 100 км и сборка' : 'Free delivery (100km) & assembly'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                <span>{lang === 'ru' ? 'Скидка 50% на свайный фундамент' : '50% off screw-pile foundation'}</span>
              </div>
              {answers[4] && (
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                  <span>{answers[4]}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <a
                href={buildMessengerUrl(
                  'whatsapp',
                  `Здравствуйте! Прошёл квиз на сайте (${phone}). Проект: ${prefilledHouseTitle || answers[1] || 'Каркасный дом'}. Пришлите, пожалуйста, расчёт сметы.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Получить в WhatsApp</span>
              </a>

              <a
                href={buildMessengerUrl(
                  'telegram',
                  `Здравствуйте! Прошёл квиз на сайте (${phone}). Хочу получить расчёт сметы.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1C88BD] text-white font-semibold text-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Написать в Telegram</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-semibold text-xs transition-all gold-glow"
              >
                {lang === 'ru' ? 'Вернуться к сайту' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
