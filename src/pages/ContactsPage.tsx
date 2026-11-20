import React from 'react';
import { COMPANY_CONFIG } from '../config/company';
import { Language } from '../types';
import { matchPublicPage } from '../site/publicSite';

interface ContactsPageProps {
  lang: Language;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ lang }) => {
  const page = matchPublicPage('/kontakty/');
  if (!page) return null;
  const ru = lang === 'ru';

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav aria-label={ru ? 'Хлебные крошки' : 'Breadcrumb'} className="text-sm text-olive dark:text-cream-soft">
        <a href="/" className="hover:text-pine dark:hover:text-brass">
          {ru ? 'Главная' : 'Home'}
        </a>
        <span aria-hidden="true"> / </span>
        <span>{page.h1}</span>
      </nav>
      <h1 className="mt-6 font-light text-4xl sm:text-5xl text-ink dark:text-cream">{page.h1}</h1>
      <p className="mt-4 text-base text-ink-soft dark:text-cream-soft">
        {ru
          ? 'Позвоните или напишите. Так договариваемся о выезде на участок.'
          : 'Call or write. That is how we arrange a visit to the plot.'}
      </p>
      <dl className="mt-10 space-y-6 text-base">
        <div>
          <dt className="text-sm text-olive dark:text-cream-soft">{ru ? 'Телефон' : 'Phone'}</dt>
          <dd className="mt-1">
            <a href={COMPANY_CONFIG.phoneHref} className="text-2xl text-ink dark:text-cream hover:text-pine">
              {COMPANY_CONFIG.phoneDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-olive dark:text-cream-soft">{ru ? 'Почта' : 'Email'}</dt>
          <dd className="mt-1">
            <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-ink dark:text-cream hover:text-pine">
              {COMPANY_CONFIG.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-olive dark:text-cream-soft">WhatsApp</dt>
          <dd className="mt-1">
            <a href={COMPANY_CONFIG.socials.whatsappUrl} className="text-ink dark:text-cream hover:text-pine">
              {COMPANY_CONFIG.phoneDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-olive dark:text-cream-soft">{ru ? 'Адрес' : 'Address'}</dt>
          <dd className="mt-1 text-ink dark:text-cream">{COMPANY_CONFIG.address[lang]}</dd>
        </div>
        <div>
          <dt className="text-sm text-olive dark:text-cream-soft">{ru ? 'Часы' : 'Hours'}</dt>
          <dd className="mt-1 text-ink dark:text-cream">{COMPANY_CONFIG.schedule[lang]}</dd>
        </div>
      </dl>
      <p className="mt-10">
        <a href="/proekty/" className="text-sm text-pine dark:text-brass hover:underline">
          {ru ? 'Смотреть проекты' : 'See projects'}
        </a>
      </p>
    </main>
  );
};
