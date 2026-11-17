import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, Building2, Mail, Phone } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_CONFIG } from '../config/company';
import { LEGAL_DOCS, LEGAL_UPDATED, LegalDocType } from '../data/legal';
import { playUiClick } from '../utils/sound';

export type { LegalDocType } from '../data/legal';

interface LegalDocumentModalProps {
  isOpen: boolean;
  docType: LegalDocType;
  lang: Language;
  onClose: () => void;
  onSwitchDoc: (type: LegalDocType) => void;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  docType,
  lang,
  onClose,
  onSwitchDoc,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = docType === 'privacy';
  const doc = LEGAL_DOCS[docType];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc.title[lang]}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-forest/75  animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-paper text-ink w-full max-w-3xl rounded-[20px]  border border-ink/15 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-forest text-cream flex flex-wrap items-center justify-between gap-3 border-b border-cream/10">
          <div className="flex items-center gap-2.5">
            {isPrivacy ? (
              <ShieldCheck className="w-5 h-5 text-brass-light shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-brass-light shrink-0" />
            )}
            <div>
              <span className="font-light text-xl sm:text-2xl leading-tight block">{doc.title[lang]}</span>
              <span className="text-[11px] text-cream-soft/80">
                {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]} · {LEGAL_UPDATED[lang]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-cream/5 border border-cream/15">
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onSwitchDoc('privacy');
                }}
                aria-pressed={isPrivacy}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isPrivacy ? 'bg-cream text-forest' : 'text-cream-soft hover:text-cream'
                }`}
              >
                {lang === 'ru' ? 'Политика (ФЗ-152)' : 'Privacy'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playUiClick('tap');
                  onSwitchDoc('terms');
                }}
                aria-pressed={!isPrivacy}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  !isPrivacy ? 'bg-cream text-forest' : 'text-cream-soft hover:text-cream'
                }`}
              >
                {lang === 'ru' ? 'Соглашение' : 'Terms'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-cream/70 hover:text-cream transition-colors"
              aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed text-ink-soft">
          <div className="p-5 rounded-xl border border-ink/15 text-xs space-y-1.5 text-ink-soft">
            <div className="font-semibold text-ink">
              {isPrivacy
                ? lang === 'ru'
                  ? 'Оператор персональных данных:'
                  : 'Personal Data Controller:'
                : lang === 'ru'
                  ? 'Информация о подрядчике:'
                  : 'Contractor Information:'}
            </div>
            <div>
              {COMPANY_CONFIG.legalName[lang]} · {COMPANY_CONFIG.regDetails[lang]}
            </div>
            <div>
              {isPrivacy
                ? lang === 'ru'
                  ? 'Юридический адрес: '
                  : 'Registered Address: '
                : lang === 'ru'
                  ? 'Производственная база: '
                  : 'Manufacturing Facility: '}
              {isPrivacy ? COMPANY_CONFIG.address[lang] : COMPANY_CONFIG.factoryAddress[lang]}
            </div>
          </div>

          {doc.sections.map((section) => (
            <section key={section.heading.ru} className="space-y-2">
              <h4 className="font-light text-xl sm:text-2xl leading-snug text-ink">{section.heading[lang]}</h4>
              {section.paragraphs?.map((p) => (
                <p key={p.ru}>{p[lang]}</p>
              ))}
              {section.items && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.ru}>{item[lang]}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 bg-paper-deep border-t border-ink/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-olive">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brass-ink" />
              <span>{COMPANY_CONFIG.legalName[lang]}</span>
            </span>
            <a href={COMPANY_CONFIG.phoneHref} className="inline-flex items-center gap-1.5 hover:text-brass-ink">
              <Phone className="w-3.5 h-3.5 text-brass-ink" />
              <span>{COMPANY_CONFIG.phoneDisplay}</span>
            </a>
            <a href={`mailto:${COMPANY_CONFIG.email}`} className="inline-flex items-center gap-1.5 hover:text-brass-ink">
              <Mail className="w-3.5 h-3.5 text-brass-ink" />
              <span>{COMPANY_CONFIG.email}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              playUiClick('tap');
              onClose();
            }}
            className="px-6 py-3 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-semibold text-xs transition-all self-end sm:self-auto"
          >
            {lang === 'ru' ? 'Понятно, закрыть' : 'Close Document'}
          </button>
        </div>
      </div>
    </div>
  );
};
