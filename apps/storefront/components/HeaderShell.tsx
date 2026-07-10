'use client';

import { useEffect, useState } from 'react';

// Section 6.6 — sticky bar gains its 1px bottom border only after the page scrolls,
// so the hero stays unobstructed on first paint.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[10] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b transition-colors duration-150 ${
        scrolled ? 'border-border' : 'border-transparent'
      }`}
    >
      {children}
    </header>
  );
}
