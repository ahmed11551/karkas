import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Send, X, PhoneCall } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG, buildMessengerUrl } from '../config/company';
import { playUiClick } from '../utils/sound';

interface MessengerFloatingProps {
  lang: Language;
  // On mobile the widget is shown only once the sticky action bar is visible (it sits above that bar).
  // At the top of the page it would cover the hero callback form, so it stays hidden there.
  showOnMobile: boolean;
}

export const MessengerFloating: React.FC<MessengerFloatingProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].messenger;
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  // Escape closes the panel, so keyboard users are never stuck inside it.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    // bottom-24 on mobile keeps the panel clear of the sticky bottom bar.
    <div
      className="fixed bottom-6 right-5 z-40 hidden md:flex flex-col items-end gap-2.5"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label={t.title}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="p-4 rounded-[20px] bg-paper text-ink border border-ink/15  mb-2 w-64 space-y-2.5 origin-bottom-right"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-ink/12">
              <span className="eyebrow text-olive">{t.title}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-olive hover:text-ink hover:bg-ink/5 transition-colors"
                aria-label={t.close}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <a
              href={buildMessengerUrl('telegram')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick('tap')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#17749F] text-xs font-semibold transition-colors"
            >
              <Send className="w-4 h-4 shrink-0 text-[#229ED9]" aria-hidden="true" />
              <span>{t.telegram}</span>
            </a>

            <a
              href={buildMessengerUrl('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick('tap')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#117A3D] text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-[#25D366]" aria-hidden="true" />
              <span>{t.whatsapp}</span>
            </a>

            <a
              href={COMPANY_CONFIG.phoneHref}
              onClick={() => playUiClick('tap')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-ink/15 hover:border-ink text-ink text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0 text-brass-ink" aria-hidden="true" />
              <span>{COMPANY_CONFIG.phoneDisplay}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle: forest disc with a brass notification dot */}
      <button
        type="button"
        onClick={() => {
          playUiClick('tick');
          setIsOpen((prev) => !prev);
        }}
        className="w-14 h-14 rounded-full bg-forest hover:bg-forest-raised text-cream border border-cream/15  flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 relative"
        aria-label={t.open}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brass ring-2 ring-paper" aria-hidden="true" />
        )}
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
      </button>
    </div>
  );
};
