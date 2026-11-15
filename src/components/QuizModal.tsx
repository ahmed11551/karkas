import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Gift, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Language } from '../types';
import { QUIZ_QUESTIONS } from '../data/translations';
import { buildMessengerUrl } from '../config/company';
import { saveLead, LeadCalculatorParams } from '../utils/leads';
import { playUiClick } from '../utils/sound';
import { formatRussianPhoneInput, validateRussianPhone } from '../utils/phoneValidation';
import { validateClientName } from '../utils/leadPayload';
import { ConsentField } from './ConsentField';

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
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [clientName, setClientName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({});
      setClientName('');
      setNameError('');
      setPhone('');
      setPhoneError('');
      setConsent(false);
      setConsentError('');
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameCheck = validateClientName(clientName, lang);
    if (!nameCheck.ok) {
      playUiClick('tick');
      setNameError(nameCheck.error);
      return;
    }
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
    if (!consent) {
      playUiClick('tick');
      setConsentError(
        lang === 'ru'
          ? 'Подтвердите согласие на обработку персональных данных.'
          : 'Please confirm consent to process your personal data.'
      );
      return;
    }
    const result = await saveLead({
      source: 'quiz_modal',
      clientName: nameCheck.value,
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
      consent: true,
    });
    if (!result.ok) {
      playUiClick('tick');
      setPhoneError(result.error || (lang === 'ru' ? 'Не удалось отправить заявку.' : 'Could not send the request.'));
      return;
    }
    playUiClick('success');
    setIsSuccess(true);
  };

  // Modal is a light paper sheet in both themes, so the consent checkbox and gold CTA keep their contrast.
  const inputClass =
    'w-full px-5 py-3.5 rounded-xl bg-white border border-ink/20 text-ink text-sm placeholder:text-olive/70 focus:outline-none focus:border-ink focus:ring-2 focus:ring-brass/40';

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-9 shadow-2xl bg-paper text-ink border border-ink/15 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-olive hover:text-ink hover:bg-ink/5 transition-colors"
          aria-label="Закрыть модальное окно"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Progress */}
            <div className="mb-8 pr-10">
              <div className="flex items-center justify-between eyebrow text-olive mb-3">
                <span>
                  {step < totalQuestions
                    ? `${lang === 'ru' ? 'Вопрос' : 'Question'} ${step + 1} ${lang === 'ru' ? 'из' : 'of'} ${totalQuestions}`
                    : lang === 'ru'
                    ? 'Финальный шаг'
                    : 'Final Step'}
                </span>
                <span className="font-mono tabular-nums">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-px bg-ink/15 relative">
                <div
                  className="absolute left-0 top-0 h-[2px] -translate-y-[0.5px] bg-brass transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            {step < totalQuestions && currentQ && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-ink">
                    {currentQ.question[lang]}
                  </h3>
                  {currentQ.hint && (
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">{currentQ.hint[lang]}</p>
                  )}
                </div>

                <div className="grid gap-2.5 pt-1">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt[lang])}
                      className="group w-full text-left px-5 py-4 rounded-xl border border-ink/20 hover:border-ink hover:bg-ink hover:text-paper transition-colors text-sm font-medium text-ink flex items-center justify-between gap-4 active:scale-[0.99]"
                    >
                      <span>{opt[lang]}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 text-olive group-hover:text-paper group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Final Phone Lead Capture Step */}
            {step === totalQuestions && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div>
                  <span className="eyebrow inline-flex items-center gap-2 text-brass-ink">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? '4 подарка закреплены' : '4 Gifts Reserved'}</span>
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-ink mt-3">
                    {lang === 'ru' ? 'Куда прислать точный расчёт?' : 'Where should we send your quote?'}
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                    {lang === 'ru'
                      ? 'Закрепим подарки за этим номером, позвоним для уточнений и пришлём точную смету в мессенджер за 15 минут.'
                      : 'We will lock your gifts, confirm options by phone, and message your turnkey breakdown in 15 minutes.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <label htmlFor="quiz-name" className="sr-only">
                    {lang === 'ru' ? 'Ваше имя' : 'Your name'}
                  </label>
                  <input
                    id="quiz-name"
                    type="text"
                    value={clientName}
                    maxLength={80}
                    autoComplete="name"
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder={lang === 'ru' ? 'Ваше имя (необязательно)' : 'Your name (optional)'}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? 'quiz-name-error' : undefined}
                    className={inputClass}
                  />
                  {nameError && (
                    <p id="quiz-name-error" role="alert" className="text-xs text-danger font-medium">
                      {nameError}
                    </p>
                  )}

                  <label htmlFor="quiz-phone" className="sr-only">
                    {lang === 'ru' ? 'Телефон' : 'Phone'}
                  </label>
                  <input
                    id="quiz-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (9__) ___-__-__"
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? 'quiz-phone-error' : undefined}
                    className={`w-full px-5 py-4 rounded-xl bg-white border text-ink font-medium text-xl tabular-nums placeholder:text-olive/60 focus:outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-danger focus:ring-danger/30'
                        : 'border-ink/25 focus:border-ink focus:ring-brass/40'
                    }`}
                    autoFocus
                  />
                  {phoneError && (
                    <p
                      id="quiz-phone-error"
                      role="alert"
                      className="mt-2 text-xs text-danger font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}

                  <ConsentField
                    id="quiz-consent"
                    lang={lang}
                    checked={consent}
                    error={consentError}
                    onChange={(checked) => {
                      setConsent(checked);
                      if (checked) setConsentError('');
                    }}
                    className="text-ink-soft"
                  />
                </div>

                {/* The one gold CTA of the modal */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-brass hover:bg-brass-hover text-[#1E1705] font-semibold text-sm transition-all gold-glow text-center active:scale-95"
                >
                  {lang === 'ru' ? 'Получить расчёт и подарки' : 'Get Detailed Calculation'}
                </button>

                <p className="text-[11px] text-center text-olive">
                  {lang === 'ru'
                    ? 'Заявка уходит только после отметки согласия и проверки номера.'
                    : 'The request is sent only after consent and a valid phone number.'}
                </p>
              </form>
            )}
          </>
        ) : (
          /* Confirmation */
          <div className="py-4 text-center space-y-5" role="status" aria-live="polite">
            <div className="w-14 h-14 rounded-full bg-forest text-brass-light mx-auto flex items-center justify-center shadow-lg">
              <Check className="w-7 h-7" strokeWidth={2.5} aria-hidden="true" />
            </div>

            <h3 className="font-serif text-4xl leading-tight text-ink">
              {lang === 'ru' ? 'Заявка принята!' : 'Inquiry Submitted!'}
            </h3>

            <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto">
              {lang === 'ru'
                ? 'Скоро перезвоним, чтобы уточнить детали и участок. Персональный расчёт со скидкой 50% на сваи и бесплатной кровлей придёт в течение 15 минут.'
                : 'Our engineer will call you shortly to confirm plot details. Your custom calculation and seasonal gifts are secured.'}
            </p>

            <div className="p-5 rounded-xl border border-ink/15 text-xs text-ink-soft text-left space-y-2.5 my-4">
              <span className="eyebrow block text-ink mb-1">
                {lang === 'ru' ? 'Ваши закрепленные бонусы' : 'Your locked perks'}
              </span>
              <div className="flex items-center gap-2.5">
                <Check className="w-3.5 h-3.5 text-brass-ink shrink-0" />
                <span>{lang === 'ru' ? 'Металлочерепица в подарок (0 ₽)' : 'Free metal tile roofing (0 ₽)'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-3.5 h-3.5 text-brass-ink shrink-0" />
                <span>{lang === 'ru' ? 'Бесплатная доставка до 100 км и сборка' : 'Free delivery (100km) & assembly'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-3.5 h-3.5 text-brass-ink shrink-0" />
                <span>{lang === 'ru' ? 'Скидка 50% на свайный фундамент' : '50% off screw-pile foundation'}</span>
              </div>
              {answers[4] && (
                <div className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-brass-ink shrink-0" />
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
                <span>{lang === 'ru' ? 'Получить в WhatsApp' : 'Send to WhatsApp'}</span>
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
                <span>{lang === 'ru' ? 'Написать в Telegram' : 'Message on Telegram'}</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-ink/30 text-ink hover:bg-ink hover:text-paper font-semibold text-xs transition-colors"
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
