import React, { useEffect, useState } from 'react';

interface RollingNumberProps {
  value: number; // e.g. 707000
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number; // ms
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  prefix = '≈ ',
  suffix = ' ₽',
  className = '',
  duration = 600,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const difference = value - startValue;

    if (difference === 0) return;

    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + difference * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      }
    };

    animFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  // Format with Russian spacing convention
  const formatted = displayValue.toLocaleString('ru-RU').replace(/\u00a0/g, ' ');

  return (
    <span className={`inline-flex items-baseline font-display tabular-nums tracking-tight ${className}`}>
      {prefix && <span className="opacity-70 text-[0.8em] mr-1">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="text-[0.75em] ml-1.5 opacity-90">{suffix}</span>}
    </span>
  );
};
