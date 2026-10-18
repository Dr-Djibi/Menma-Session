'use client';

import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap className="w-4 h-4 text-gold" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base md:text-lg block leading-tight">
              MENMA<span className="text-gold">.MD</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
              Session Protocol
            </span>
          </div>
        </Link>

        {/* Live operational badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-3.5" />
          <span className="text-xs font-medium text-emerald-300">En ligne</span>
        </div>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <Link href="/pair" className="hover:text-gold transition-colors">
            Code Pairing
          </Link>
          <Link href="/qr" className="hover:text-gold transition-colors">
            QR Scan
          </Link>
          <Link href="/env" className="hover:text-gold transition-colors">
            Générateur .ENV
          </Link>
          <Link href="/dashboard" className="hover:text-gold transition-colors">
            Dashboard
          </Link>
        </nav>

        {/* GitHub link button */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Dr-Djibi/Menma-MD"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:border-gold/40 hover:bg-white/5 text-xs text-neutral-300 transition-all touch-scale"
          >
            <svg className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">Dr-Djibi</span>
          </a>
        </div>
      </div>
    </header>
  );
}
