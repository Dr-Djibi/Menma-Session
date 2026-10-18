'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { QrCode, KeyRound, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: -20,
        duration: 0.8,
      })
        .from(
          '.hero-title-line',
          {
            opacity: 0,
            y: 35,
            duration: 1,
            stagger: 0.15,
          },
          '-=0.5'
        )
        .from(
          '.hero-desc',
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          '.hero-btn',
          {
            opacity: 0,
            scale: 0.95,
            y: 15,
            duration: 0.7,
            stagger: 0.12,
          },
          '-=0.5'
        )
        .from(
          '.hero-stat-pill',
          {
            opacity: 0,
            y: 10,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.4'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-16 md:pt-24 md:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center overflow-hidden"
    >
      {/* 1. Protocol Badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-6">
        <Sparkles className="w-3.5 h-3.5 text-gold animate-spin-slow" />
        <span className="text-xs font-semibold tracking-wide text-gold-light uppercase">
          Générateur de Session WhatsApp v2.0
        </span>
      </div>

      {/* 2. Headline with Split Lines */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
        <span className="hero-title-line block">
          Connectez votre bot <span className="text-gold">Menma-MD</span>
        </span>
        <span className="hero-title-line block text-neutral-300 font-medium text-2xl sm:text-4xl md:text-5xl mt-1">
          en toute sécurité en quelques secondes
        </span>
      </h1>

      {/* 3. Description */}
      <p className="hero-desc text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto mb-9 leading-relaxed">
        Générez votre Session ID officiel via <strong className="text-white font-semibold">Code de Couplage</strong> à 8 chiffres ou par <strong className="text-white font-semibold">Scan QR</strong> instantané sans déconnexion.
      </p>

      {/* 4. Action Buttons (Mobile-first, touch friendly, min-height 52px) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-12">
        <Link
          href="/pair"
          className="hero-btn w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition-all touch-scale"
        >
          <KeyRound className="w-4 h-4 text-dark-950" />
          <span>CODE DE JUMELAGE</span>
          <ArrowRight className="w-4 h-4 ml-1 text-dark-950" />
        </Link>

        <Link
          href="/qr"
          className="hero-btn w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-xl glass-panel hover:bg-white/10 active:scale-95 text-white font-semibold text-sm border border-white/15 flex items-center justify-center gap-2.5 transition-all touch-scale"
        >
          <QrCode className="w-4 h-4 text-gold" />
          <span>SCANNER LE QR CODE</span>
        </Link>
      </div>

      {/* 5. Trust / Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-400">
        <div className="hero-stat-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chiffrement Baileys v7 End-to-End</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Pastebin Encrypted Vault</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
          <span className="text-gold font-mono font-bold">0.4s</span>
          <span>Délai de génération moyen</span>
        </div>
      </div>
    </section>
  );
}
