import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Phone, Calculator, MessageCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COMPANY_CONFIG, buildMessengerUrl } from '../config/company';
import { playUiClick } from '../utils/sound';

interface StickyMobileBarProps {
  lang: Language;
  onOpenQuiz: () => void;
  isVisible: boolean;
}

// Persistent mobile action bar: forest + cream, so it does not compete with the gold CTA of each section.
// bottom uses the safe-area inset, so the bar clears the iPhone home indicator.
export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ lang, onOpenQuiz, isVisible }) => {
  const t = TRANSLATIONS[lang];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="sticky-mobile-bar"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed left-3 right-3 z-40 bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="p-2 rounded-[20px] bg-forest border border-cream/10  flex items-center gap-2">
            <a
              href={COMPANY_CONFIG.phoneHref}
              onClick={() => playUiClick('tap')}
              className="min-w-11 min-h-11 p-3 rounded-xl border border-cream/20 text-cream hover:bg-cream/10 transition-colors flex items-center justify-center shrink-0"
              aria-label={t.sticky.call}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
            </a>

            <a
              href={buildMessengerUrl('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick('tap')}
              className="min-w-11 min-h-11 p-3 rounded-xl border border-cream/20 text-cream hover:bg-cream/10 transition-colors flex items-center justify-center shrink-0"
              aria-label={t.sticky.whatsapp}
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onOpenQuiz}
              className="flex-1 min-h-11 py-3 px-4 rounded-xl bg-cream hover:bg-cream-soft text-forest font-semibold text-sm tracking-tight transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.sticky.calculate}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
