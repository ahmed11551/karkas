import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, MessageCircle, Send } from 'lucide-react';
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

// Real finished house from the client's archive (square source, cropped to 4:5 on the page).
const HERO_PHOTO = '/gallery/houses/hou-018.webp';

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
      giftsSelected: ['Кровля из металлочерепицы', 'Бесплатная доставка 100 км'],
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
    <section className="relative overflow-hidden bg-forest pt-28 pb-20 md:pt-36 md:pb-28 text-cream">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left column: offer, form, secondary action */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <p className="eyebrow flex items-center gap-3 text-brass mb-8">
              <span className="h-px w-8 bg-brass" aria-hidden="true" />
              <span>{t.hero.monthlyGift}</span>
            </p>

            <h1 className="font-light text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem] tracking-[-0.03em] text-cream max-w-3xl text-balance">
              {t.hero.titlePre}
              {t.hero.titleHighlight}
              {t.hero.titlePost}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-cream-soft leading-relaxed max-w-xl">{t.hero.lead}</p>

            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-cream-soft my-8">
              {t.hero.chips.map((chip, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brass shrink-0" aria-hidden="true" />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>

            <div className="w-full max-w-lg">
              {formSubmitted ? (
                <div className="p-5 rounded-[12px] bg-forest-raised border border-cream/15 space-y-3 text-cream-soft">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-brass shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-medium text-cream">{t.hero.quickCallSuccess}</p>
                      <p className="text-xs text-cream-soft mt-0.5">
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
                      className={`flex-1 h-14 px-5 rounded-[12px] bg-cream text-ink placeholder-ink-soft/70 font-medium text-base focus:outline-none focus:ring-2 transition-shadow ${
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
                      className="text-xs text-rose-300 px-1 font-medium flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
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
                    className="px-1 text-cream-soft"
                  />
                </form>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-cream/15 w-full max-w-lg">
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onOpenQuiz();
                }}
                className="btn-outline inline-flex items-center gap-2 px-5 py-3 rounded-[12px] text-cream hover:border-brass hover:text-brass font-medium text-sm transition-colors group"
              >
                <span>{t.hero.quizBtn}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right column: one real finished house, flat frame, no effects */}
          <div className="lg:col-span-5 relative">
            <figure className="relative w-full max-w-[460px] mx-auto lg:ml-auto">
              <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-forest-raised">
                <img
                  src={HERO_PHOTO}
                  alt={lang === 'ru' ? 'Готовый каркасный дом Каркасник с верандой' : 'Finished Karkasnik timber-frame house with a porch'}
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-[50%_45%]"
                />
              </div>
              <figcaption className="absolute left-4 bottom-4 right-4 sm:right-auto sm:w-auto flex items-end gap-4 rounded-[12px] bg-paper text-ink px-5 py-4">
                <span className="font-light text-3xl sm:text-4xl leading-none tabular-nums tracking-[-0.02em]">38 000</span>
                <span className="text-xs sm:text-sm text-ink-soft leading-snug max-w-[11rem] pb-0.5">
                  {t.hero.housesBuiltBadge}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
