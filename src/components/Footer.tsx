import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Mail } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG } from '../config/company';
import { LegalDocumentModal, LegalDocType } from './LegalDocumentModal';
import { playUiClick } from '../utils/sound';

interface FooterProps {
  lang: Language;
  isAdminAuthenticated?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenCrm?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onOpenCrm,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') setActiveLegalDoc('privacy');
    else if (path === '/terms') setActiveLegalDoc('terms');
  }, []);

  const handleOpenLegalDoc = (e: React.MouseEvent<HTMLAnchorElement>, doc: LegalDocType) => {
    e.preventDefault();
    playUiClick('tap');
    setActiveLegalDoc(doc);
  };

  const labelClass = 'eyebrow block mb-4 text-olive dark:text-cream-soft';
  const linkClass =
    'text-ink-soft dark:text-cream-soft hover:text-ink dark:hover:text-cream underline-offset-4 hover:underline transition-colors';

  return (
    <footer className="border-t border-ink/15 dark:border-cream/12 pt-16 pb-24 lg:pb-16 text-xs text-ink-soft dark:text-cream-soft relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-14">
          {/* Col 1: Brand & Registration */}
          <div>
            <a
              href="#"
              className="flex items-center gap-2.5 font-serif text-2xl text-ink dark:text-cream mb-4"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-brass" aria-hidden="true" />
              <span>{t.brandName}</span>
            </a>
            <p className="leading-relaxed text-sm text-ink dark:text-cream">{t.footer.company}</p>
            <p className="mt-2 font-mono text-[11px] opacity-80">{t.footer.regDetails}</p>
          </div>

          {/* Col 2: Physical Address & Office */}
          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Офис и производство' : 'Office & Factory'}</span>
            <p className="leading-relaxed">{t.footer.address}</p>
            <p className="mt-1 leading-relaxed text-[11px] opacity-85">
              {COMPANY_CONFIG.factoryAddress[lang]}
            </p>
          </div>

          {/* Col 3: Direct Telephone, Email & Working hours */}
          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Контакты' : 'Contact'}</span>
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="font-serif text-2xl text-ink dark:text-cream hover:text-brass-ink dark:hover:text-brass-light transition-colors block"
            >
              {COMPANY_CONFIG.phoneDisplay}
            </a>
            <p className="mt-2">{t.footer.schedule}</p>
            <a
              href={`mailto:${COMPANY_CONFIG.email}`}
              className="mt-3 inline-flex items-center gap-2 text-ink dark:text-cream hover:text-brass-ink dark:hover:text-brass-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-brass-ink dark:text-brass-light" />
              <span>{COMPANY_CONFIG.email}</span>
            </a>
          </div>

          {/* Col 4: Legal, Policies & Staff /login Portal */}
          <div>
            <span className={labelClass}>{lang === 'ru' ? 'Документы и доступ' : 'Legal & Staff'}</span>
            <ul className="space-y-2.5">
              <li>
                <a href="/privacy" onClick={(e) => handleOpenLegalDoc(e, 'privacy')} className={linkClass}>
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="/terms" onClick={(e) => handleOpenLegalDoc(e, 'terms')} className={linkClass}>
                  {t.footer.terms}
                </a>
              </li>
              <li className="pt-2">
                {isAdminAuthenticated ? (
                  <button
                    onClick={onOpenCrm}
                    className="inline-flex items-center gap-2 text-ink dark:text-cream font-semibold border-b border-ink/40 dark:border-cream/40 hover:border-ink dark:hover:border-cream pb-0.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Открыть CRM (Админ)' : 'Open CRM Panel'}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdminLogin}
                    className="inline-flex items-center gap-2 text-olive dark:text-cream-soft hover:text-ink dark:hover:text-cream transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{lang === 'ru' ? 'Вход для сотрудников (/login)' : 'Staff Login (/login)'}</span>
                  </button>
                )}
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

      <LegalDocumentModal
        isOpen={activeLegalDoc !== null}
        docType={activeLegalDoc || 'privacy'}
        lang={lang}
        onClose={() => setActiveLegalDoc(null)}
        onSwitchDoc={(doc) => setActiveLegalDoc(doc)}
      />
    </footer>
  );
};
