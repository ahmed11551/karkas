import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { buildMessengerUrl } from '../config/company';
import { saveLead } from '../utils/leads';
import { playUiClick } from '../utils/sound';
import { formatRussianPhoneInput, validateRussianPhone } from '../utils/phoneValidation';
import { ConsentField } from './ConsentField';

interface HeroProps {
  lang: Language;
  onOpenQuiz: () => void;
  // Kept for API compatibility with App. The day/night illustration was replaced by a real project photo.
  isNightScene?: boolean;
  onToggleScene?: () => void;
}

const HERO_PHOTO = {
  src: '/images/hero/hero-house.webp',
  alt: {
    ru: 'Каркасный дом с крыльцом в берёзовой роще на закате',
    en: 'Timber-frame house with a porch in a birch grove at sunset',
  },
} as const;

export const Hero: React.FC<HeroProps> = ({ lang, onOpenQuiz }) => {
  const t = TRANSLATIONS[lang];
  const [phoneInput, setPhoneInput] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRussianPhoneInput(e.target.value);
    setPhoneInput(formatted);
    if (formError) setFormError('');
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRussianPhone(phoneInput, lang);
    if (!validation.isValid) {
      playUiClick('tick');
      setFormError(validation.error || t.hero.quickCallError);
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
      source: 'hero_quick',
      phone: validation.normalized || phoneInput,
      giftsSelected: ['Кровля из металлочерепицы', 'Бесплатная доставка 500 км'],
      consent: true,
    });
    if (!result.ok) {
      playUiClick('tick');
      setFormError(result.error || t.hero.quickCallError);
      return;
    }
    playUiClick('success');
    setFormSubmitted(true);
    setFormError('');
    setConsentError('');
  };

  return (
    <>
    <section className="relative min-h-[100svh] overflow-hidden bg-forest text-cream">
      <img
        src={HERO_PHOTO.src}
        alt={HERO_PHOTO.alt[lang]}
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/15 to-transparent" aria-hidden="true" />
      <div className="relative flex min-h-[100svh] items-end">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-32 md:pb-20">
          <div className="max-w-3xl">
            <h1 className="font-light text-[2.75rem] leading-[0.98] sm:text-6xl lg:text-[4.75rem] tracking-[-0.035em] text-cream text-balance">
              {t.hero.titlePre}
              {t.hero.titleHighlight}
              {t.hero.titlePost}
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-cream leading-relaxed">{t.hero.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onOpenQuiz();
                }}
                className="inline-flex items-center gap-2 h-14 px-7 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-medium text-sm"
              >
                <span>{lang === 'ru' ? 'Рассчитать' : 'Calculate'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <a href="/proekty/" className="text-sm text-cream underline underline-offset-4">
                {lang === 'ru' ? 'Смотреть проекты' : 'See projects'}
              </a>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              {[
                { value: t.stats.assemblyCount, label: t.stats.assemblyLabel },
                { value: lang === 'ru' ? 'Москва и МО' : 'Moscow region', label: lang === 'ru' ? 'география' : 'where we build' },
                { value: t.stats.warrantyCount, label: t.stats.warrantyLabel },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-light text-lg sm:text-xl text-cream leading-none">{item.value}</dt>
                  <dd className="mt-1 text-[11px] text-cream-soft leading-snug">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-paper text-ink dark:bg-forest dark:text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-lg">
          <p className="eyebrow text-olive dark:text-brass mb-4">{t.hero.monthlyGift}</p>
            <div className="w-full">
              {formSubmitted ? (
                <div className="p-5 rounded-[12px] bg-paper-deep dark:bg-forest-raised border border-ink/10 dark:border-cream/15 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-brass shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-medium text-ink dark:text-cream">{t.hero.quickCallSuccess}</p>
                      <p className="text-xs text-ink-soft dark:text-cream-soft mt-0.5">
                        {lang === 'ru'
                          ? 'Мы закрепили за вами подарки по акции. Можете сразу написать инженеру:'
                          : 'Your promotional gifts are reserved. Message our engineer directly:'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={buildMessengerUrl(
                        'whatsapp',
                        `Здравствуйте! Оставил заявку на сайте (${phoneInput}). Хочу получить расчёт дома и закрепить подарки по акции.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Написать в WhatsApp' : 'Message on WhatsApp'}</span>
                    </a>
                    <a
                      href={buildMessengerUrl(
                        'telegram',
                        `Здравствуйте! Оставил заявку на сайте (${phoneInput}). Хочу получить расчёт дома.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#229ED9] hover:bg-[#1C88BD] text-white text-xs font-semibold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Написать в Telegram' : 'Message on Telegram'}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} noValidate className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label htmlFor="hero-phone" className="sr-only">
                      {lang === 'ru' ? 'Номер телефона для звонка' : 'Phone number'}
                    </label>
                    <input
                      id="hero-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={18}
                      required
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      placeholder={t.hero.quickCallPlaceholder}
                      aria-invalid={Boolean(formError)}
                      aria-describedby={formError ? 'hero-phone-error' : undefined}
                      className={`flex-1 h-14 px-5 rounded-[12px] bg-paper-deep dark:bg-cream text-ink placeholder-ink-soft/70 font-medium text-base focus:outline-none focus:ring-2 ${
                        formError ? 'ring-2 ring-rose-400' : 'focus:ring-brass'
                      }`}
                    />
                    <button
                      type="submit"
                      className="h-14 px-7 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-medium text-sm transition-colors whitespace-nowrap active:scale-[0.98]"
                    >
                      {t.hero.quickCallBtn}
                    </button>
                  </div>
                  {formError && (
                    <p
                      id="hero-phone-error"
                      role="alert"
                      className="text-xs text-rose-700 dark:text-rose-300 px-1 font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formError}</span>
                    </p>
                  )}
                  <ConsentField
                    id="hero-consent"
                    lang={lang}
                    checked={consent}
                    error={consentError}
                    onChange={(checked) => {
                      setConsent(checked);
                      if (checked) setConsentError('');
                    }}
                    className="px-1"
                  />
                </form>
              )}
            </div>
        </div>
      </div>
    </section>
    </>
  );
};
