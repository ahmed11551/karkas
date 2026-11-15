import React, { Suspense, useEffect, useRef, useState } from 'react';
import type Lenis from 'lenis';

const MOUNT_BEFORE_EVENT = 'karkas:lazy-mount-before';

/** Mounts every not-yet-mounted section that sits above document position `y`. */
const mountSectionsBefore = (y: number) => {
  window.dispatchEvent(new CustomEvent(MOUNT_BEFORE_EVENT, { detail: { y } }));
};

/**
 * Smooth-scrolls to an in-page anchor. Sections above the target are mounted first, because
 * their real height differs from the reserved min-height: if they mounted during the scroll,
 * the target would move and the scroll would end in the wrong place.
 */
export const scrollToAnchorWhenReady = (lenis: Lenis, selector: string, immediate: boolean) => {
  const initial = document.querySelector<HTMLElement>(selector);
  if (!initial) return;
  mountSectionsBefore(initial.getBoundingClientRect().top + window.scrollY);

  const startedAt = performance.now();
  const attempt = () => {
    const target = document.querySelector<HTMLElement>(selector);
    const timedOut = performance.now() - startedAt > 2500;

    if (!timedOut) {
      if (!target) {
        window.setTimeout(attempt, 60);
        return;
      }
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      const pendingAbove = Array.from(document.querySelectorAll<HTMLElement>('[data-lazy-placeholder]')).some(
        (el) => el !== target && el.getBoundingClientRect().top + window.scrollY < targetY
      );
      if (pendingAbove) {
        window.setTimeout(attempt, 60);
        return;
      }
    }

    if (target) {
      // Lenis caches the scroll limit. Sections above just mounted, so the page got taller:
      // refresh the limit, otherwise the scroll stops at the old bottom of the page.
      lenis.resize();
      lenis.scrollTo(target, { offset: -80, duration: 1.2, immediate });
    }
  };
  attempt();
};

interface LazyMountProps {
  children: React.ReactNode;
  /**
   * Id of the section this placeholder stands for. It is on the placeholder until the section
   * mounts (the section then carries the same id), so #anchor links keep working.
   */
  anchorId?: string;
  /** Height reserved while the section is not mounted or its code is still loading. */
  minHeight?: string;
  /** How far before the viewport the section starts loading its code. */
  rootMargin?: string;
}

/**
 * Renders children only when the placeholder approaches the viewport (or an anchor link
 * needs the sections above it). Combined with React.lazy this keeps the code of
 * below-the-fold sections out of the first load. Once mounted, it never unmounts.
 */
export const LazyMount: React.FC<LazyMountProps> = ({
  children,
  anchorId,
  minHeight = '400px',
  rootMargin = '800px 0px',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;

    // Old browsers without IntersectionObserver get the content immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setMounted(true);
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  useEffect(() => {
    if (mounted) return;
    const onMountBefore = (event: Event) => {
      const el = ref.current;
      if (!el) return;
      const { y } = (event as CustomEvent<{ y: number }>).detail;
      if (el.getBoundingClientRect().top + window.scrollY <= y) setMounted(true);
    };
    window.addEventListener(MOUNT_BEFORE_EVENT, onMountBefore);
    return () => window.removeEventListener(MOUNT_BEFORE_EVENT, onMountBefore);
  }, [mounted]);

  if (!mounted) {
    return <div ref={ref} id={anchorId} data-lazy-placeholder style={{ minHeight }} />;
  }

  // The fallback keeps the reserved height while the section's code is downloading, so the
  // page does not collapse and jump when the chunk arrives.
  return (
    <Suspense fallback={<div data-lazy-placeholder style={{ minHeight }} />}>{children}</Suspense>
  );
};
