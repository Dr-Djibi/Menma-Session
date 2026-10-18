'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 p-3 rounded-full bg-gold/90 hover:bg-gold text-dark-950 shadow-xl border border-gold/40 transition-all duration-300 hover:scale-110 active:scale-95 touch-scale"
    >
      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
    </button>
  );
}
