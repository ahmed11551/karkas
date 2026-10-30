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

  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 pt-16 pb-24 lg:pb-16 text-xs text-neutral-500 dark:text-neutral-400 relative">
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
            <p className="leading-relaxed font-medium text-neutral-700 dark:text-neutral-300">
              {t.footer.company}
            </p>
            <p className="mt-1 font-mono text-[11px] opacity-80">{t.footer.regDetails}</p>
          </div>

          {/* Col 2: Physical Address & Office */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Офис и производство' : 'Office & Factory'}
            </span>
            <p className="leading-relaxed">{t.footer.address}</p>
            <p className="mt-1 leading-relaxed text-[11px] opacity-85">
              {COMPANY_CONFIG.factoryAddress[lang]}
            </p>
          </div>

          {/* Col 3: Direct Telephone, Email & Working hours */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Контакты' : 'Contact'}
            </span>
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[#B27D18] dark:hover:text-[#E6B860] transition-colors block"
            >
              {COMPANY_CONFIG.phoneDisplay}
            </a>
            <p className="mt-1">{t.footer.schedule}</p>
            <a
              href={`mailto:${COMPANY_CONFIG.email}`}
              className="mt-1.5 inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-[#B27D18] dark:hover:text-[#E6B860] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#E6B860]" />
              <span>{COMPANY_CONFIG.email}</span>
            </a>
          </div>

          {/* Col 4: Legal, Policies & Staff /login Portal */}
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
              {lang === 'ru' ? 'Документы и доступ' : 'Legal & Staff'}
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleOpenLegalDoc(e, 'privacy')}
                  className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleOpenLegalDoc(e, 'terms')}
                  className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  {t.footer.terms}
                </a>
              </li>
              <li className="pt-1">
                {isAdminAuthenticated ? (
                  <button
                    onClick={onOpenCrm}
                    className="inline-flex items-center gap-1.5 text-[#B27D18] dark:text-[#E6B860] font-semibold hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Открыть CRM (Админ)' : 'Open CRM Panel'}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdminLogin}
                    className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-[#B27D18] dark:hover:text-[#E6B860] transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{lang === 'ru' ? 'Вход для сотрудников (/login)' : 'Staff Login (/login)'}</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] opacity-75">
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
