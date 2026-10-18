'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, KeyRound, FileCode2, Home } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/pair', label: 'Code', icon: KeyRound },
    { href: '/qr', label: 'QR Scan', icon: QrCode },
    { href: '/env', label: '.ENV', icon: FileCode2 },
  ];

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  };

  return (
    <nav
      aria-label="Navigation mobile rapide"
      className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 glass-panel rounded-2xl p-1.5 shadow-2xl border border-white/10 backdrop-blur-xl"
    >
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1.5 px-1 rounded-xl transition-all duration-200 touch-scale ${
                isActive
                  ? 'text-gold font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-gold/15 border border-gold/30 shadow-sm -z-10" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110 text-gold stroke-[2.2]' : 'text-neutral-400'}`} />
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-gold-light font-bold' : 'text-neutral-400'}`}>{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-gold absolute bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
