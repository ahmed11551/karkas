import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calculator } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
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
          <div className="p-2 rounded-[20px] bg-forest border border-cream/10">
            <button
              type="button"
              onClick={() => {
                playUiClick('tap');
                onOpenQuiz();
              }}
              className="w-full min-h-11 py-3 px-4 rounded-xl bg-brass hover:bg-brass-hover text-ink font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
