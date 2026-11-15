import React from 'react';
import type { Language } from '../types';

interface ConsentFieldProps {
  id: string;
  lang: Language;
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
  className?: string;
  /** 'dark' for use on forest surfaces: light checkbox accent. */
  tone?: 'light' | 'dark';
}

export const ConsentField: React.FC<ConsentFieldProps> = ({
  id,
  lang,
  checked,
  error,
  onChange,
  className = '',
  tone = 'light',
}) => {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-start gap-2.5 text-[11px] leading-relaxed text-current/80">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-400 ${
            tone === 'dark' ? 'accent-[#E0C27F]' : 'accent-[#183B30]'
          }`}
        />
        <span>
          {lang === 'ru'
            ? 'Соглашаюсь на обработку персональных данных для обратного звонка и расчёта сметы.'
            : 'I agree to the processing of my personal data for a callback and an estimate.'}{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline underline-offset-2 hover:opacity-80"
          >
            {lang === 'ru' ? 'Политика обработки данных' : 'Privacy Policy'}
          </a>
        </span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[11px] font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};
