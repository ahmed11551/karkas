import React from 'react';

/**
 * Wordmark. The name is set in Onest — Instrument Serif has no Cyrillic,
 * so the old serif stack was falling back to Times and colliding with «57».
 * The number is a house number: brass, mono, clearly after the name.
 * The mark is a timber bent, one stroke, hidden on a narrow header.
 */
export const Logo: React.FC<{ name: string; className?: string; compact?: boolean }> = ({
  name,
  className = '',
  compact = false,
}) => (
  <span className={`inline-flex items-center gap-[0.45em] ${className}`}>
    <svg
      viewBox="0 0 18 16"
      className={`h-[0.78em] w-[0.88em] shrink-0 ${compact ? 'hidden sm:block' : ''}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.25 15 V7.2 L9 1.25 L16.75 7.2 V15"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="miter"
      />
      <path d="M1.25 7.2 H16.75" stroke="currentColor" strokeWidth="1.35" />
    </svg>
    <span className="inline-flex items-baseline gap-[0.4em] leading-none">
      <span className="font-sans font-medium tracking-[-0.02em]">{name}</span>
      <span className="logo-num font-mono text-[0.72em] font-medium tracking-[0.06em]">57</span>
    </span>
  </span>
);
