'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AmbientSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only track cursor on pointer-capable devices
    if (window.matchMedia('(hover: hover)').matches) {
      const el = spotlightRef.current;
      if (!el) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power2.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power2.out' });

      const handleMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic desktop spotlight */}
      <div
        ref={spotlightRef}
        className="hidden md:block absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl"
        style={{ willChange: 'transform' }}
      />
      {/* Soft mobile ambient glowing orbs */}
      <div className="md:hidden absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold/10 blur-3xl animate-pulse-slow" />
      <div className="md:hidden absolute top-96 -right-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
    </div>
  );
}
