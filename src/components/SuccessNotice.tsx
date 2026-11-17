import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface SuccessNoticeProps {
  /** 'light' for paper surfaces, 'dark' for forest surfaces. */
  tone: 'light' | 'dark';
  title: string;
  text?: string;
  children?: React.ReactNode;
}

// Confirmation shown after a lead is saved. role="status" makes screen readers announce it.
export const SuccessNotice: React.FC<SuccessNoticeProps> = ({ tone, title, text, children }) => {
  const isLight = tone === 'light';

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <div className="flex items-start gap-3">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isLight ? 'bg-forest text-brass-light' : 'bg-brass text-ink'
          }`}
          aria-hidden="true"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </motion.span>
        <div className="min-w-0 pt-0.5">
          <p className={`font-light text-2xl leading-tight ${isLight ? 'text-ink' : 'text-cream'}`}>{title}</p>
          {text && (
            <p className={`mt-1 text-sm leading-relaxed ${isLight ? 'text-ink-soft' : 'text-cream-soft'}`}>{text}</p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
};
