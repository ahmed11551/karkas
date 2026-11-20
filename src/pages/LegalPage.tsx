import React from 'react';
import { COMPANY_CONFIG } from '../config/company';
import { LEGAL_DOCS, LEGAL_UPDATED, LegalDocType } from '../data/legal';
import { Language } from '../types';

interface LegalPageProps {
  lang: Language;
  docType: LegalDocType;
}

export const LegalPage: React.FC<LegalPageProps> = ({ lang, docType }) => {
  const doc = LEGAL_DOCS[docType];
  const ru = lang === 'ru';
  const other: LegalDocType = docType === 'privacy' ? 'terms' : 'privacy';

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav aria-label={ru ? 'Хлебные крошки' : 'Breadcrumb'} className="text-sm text-olive dark:text-cream-soft">
        <a href="/" className="hover:text-pine dark:hover:text-brass">
          {ru ? 'Главная' : 'Home'}
        </a>
        <span aria-hidden="true"> / </span>
        <span>{doc.title[lang]}</span>
      </nav>
      <h1 className="mt-6 font-light text-4xl sm:text-5xl leading-tight text-ink dark:text-cream">{doc.title[lang]}</h1>
      <p className="mt-3 text-sm text-olive dark:text-cream-soft">
        {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]} · {LEGAL_UPDATED[lang]}
      </p>
      <p className="mt-6 text-sm text-ink-soft dark:text-cream-soft">
        {docType === 'privacy'
          ? ru
            ? `Юридический адрес: ${COMPANY_CONFIG.address.ru}`
            : `Registered address: ${COMPANY_CONFIG.address.en}`
          : ru
            ? `Производственная база: ${COMPANY_CONFIG.factoryAddress.ru}`
            : `Manufacturing facility: ${COMPANY_CONFIG.factoryAddress.en}`}
      </p>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-ink-soft dark:text-cream-soft">
        {doc.sections.map((section) => (
          <section key={section.heading.ru}>
            <h2 className="font-light text-2xl text-ink dark:text-cream">{section.heading[lang]}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph.ru} className="mt-3">
                {paragraph[lang]}
              </p>
            ))}
            {section.items && (
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item.ru}>{item[lang]}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="mt-12">
        <a href={other === 'privacy' ? '/privacy' : '/terms'} className="text-sm text-pine dark:text-brass hover:underline">
          {LEGAL_DOCS[other].title[lang]}
        </a>
      </p>
    </main>
  );
};
