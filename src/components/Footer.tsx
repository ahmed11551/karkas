import React from 'react';
import { Mail } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG } from '../config/company';
import { Logo } from './Logo';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const labelClass = 'eyebrow block mb-4 text-olive dark:text-cream-soft';
  const linkClass =
    'text-ink-soft dark:text-cream-soft hover:text-ink dark:hover:text-cream underline-offset-4 hover:underline transition-colors';

  return (
    <footer className="border-t border-ink/15 dark:border-cream/12 pt-20 pb-24 lg:pb-16 text-xs text-ink-soft dark:text-cream-soft relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-14">
          {/* Col 1: Brand & Registration */}
          <div>
            <a
              href="/"
              className="text-[1.7rem] text-ink dark:text-cream mb-4"
            >
              <Logo name={t.brandName} />
            </a>
            <p className="leading-relaxed text-sm text-ink dark:text-cream">{t.footer.company}</p>
            <p className="mt-2 font-mono text-[11px] opacity-80">{t.footer.regDetails}</p>
          </div>

          {/* Col 2: Physical Address & Office */}
          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Офис и производство' : 'Office & Factory'}</span>
            <p className="leading-relaxed">{t.footer.address}</p>
          </div>

          {/* Col 3: Direct Telephone, Email & Working hours */}
          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Контакты' : 'Contact'}</span>
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="font-light text-2xl text-ink dark:text-cream hover:text-pine dark:hover:text-brass-light transition-colors block"
            >
              {COMPANY_CONFIG.phoneDisplay}
            </a>
            <p className="mt-2">{t.footer.schedule}</p>
            <a
              href={`mailto:${COMPANY_CONFIG.email}`}
              className="mt-3 inline-flex items-center gap-2 text-ink dark:text-cream hover:text-pine dark:hover:text-brass-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-brass-ink dark:text-brass-light" />
              <span>{COMPANY_CONFIG.email}</span>
            </a>
            <a href="/kontakty/" className={`${linkClass} mt-3 inline-block`}>
              {lang === 'ru' ? 'Все контакты' : 'All contacts'}
            </a>
          </div>

          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Документы' : 'Documents'}</span>
            <ul className="space-y-2.5">
              <li>
                <a href="/privacy" className={linkClass}>
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="/terms" className={linkClass}>
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-ink/12 dark:border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] opacity-75">
          <p>
            © {COMPANY_CONFIG.foundedYear}–{new Date().getFullYear()} {t.brandName}. {t.footer.rights}
          </p>
          <p>{lang === 'ru' ? 'Сделано с бескомпромиссным качеством' : 'Engineered with Scandinavian precision'}</p>
        </div>
      </div>
    </footer>
  );
};
