import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

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
  duration = 550,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const counterRef = useRef<{ val: number }>({ val: value });
  const textSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (counterRef.current.val === value) return;

    const durationSec = duration / 1000;

    // 60fps GSAP tween for rapid odometer number roll
    const tween = gsap.to(counterRef.current, {
      val: value,
      duration: durationSec,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayValue(Math.round(counterRef.current.val));
      },
    });

    // Subtle kinetic velocity pulse on the number node
    if (textSpanRef.current) {
      gsap.fromTo(
        textSpanRef.current,
        { y: -3, scale: 1.03 },
        { y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' }
      );
    }

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  // Format with Russian spacing convention
  const formatted = displayValue.toLocaleString('ru-RU').replace(/\u00a0/g, ' ');

  return (
    <span className={`inline-flex items-baseline font-display tabular-nums tracking-tight ${className}`}>
      {prefix && <span className="opacity-70 text-[0.8em] mr-1">{prefix}</span>}
      <span ref={textSpanRef} className="inline-block will-change-transform">
        {formatted}
      </span>
      {suffix && <span className="text-[0.75em] ml-1.5 opacity-90">{suffix}</span>}
    </span>
  );
};
