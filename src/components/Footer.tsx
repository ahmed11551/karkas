import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 pt-16 pb-24 lg:pb-16 text-xs text-neutral-500 dark:text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Registration */}
          <div>
            <a
              href="#"
              className="flex items-center gap-2 font-display font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-3"
            >
              <span className="w-3 h-3 rounded-sm rounded-br-none bg-[#E6B860]" />
              <span>{t.brandName}</span>
            </a>
            <p className="leading-relaxed">{t.footer.company}</p>
            <p className="mt-1 font-mono text-[11px] opacity-80">{t.footer.regDetails}</p>
          </div>

          {/* Col 2: Physical Address & Office */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Офис и производство' : 'Office & Factory'}
            </span>
            <p className="leading-relaxed">{t.footer.address}</p>
            <p className="mt-1 leading-relaxed">{lang === 'ru' ? 'Московская область' : 'Moscow Region'}</p>
          </div>

          {/* Col 3: Direct Telephone & Working hours */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Контакты' : 'Contact'}
            </span>
            <a
              href="tel:+74951520242"
              className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[#B27D18] dark:hover:text-[#E6B860] transition-colors block"
            >
              +7 (495) 152-02-42
            </a>
            <p className="mt-1">{t.footer.schedule}</p>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Документы' : 'Legal'}
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="#"
                  className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] opacity-75">
          <p>© 2010–{new Date().getFullYear()} {t.brandName}. {t.footer.rights}</p>
          <p>{lang === 'ru' ? 'Сделано с бескомпромиссным качеством' : 'Engineered with Scandinavian precision'}</p>
        </div>
      </div>
    </footer>
  );
};
