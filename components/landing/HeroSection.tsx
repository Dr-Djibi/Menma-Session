'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { QrCode, KeyRound, Sparkles, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.7,
      })
        .from(
          '.hero-title-line',
          {
            opacity: 0,
            y: 35,
            duration: 0.9,
            stagger: 0.15,
          },
          '-=0.4'
        )
        .from(
          '.hero-desc',
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
          },
          '-=0.5'
        )
        .from(
          '.hero-btn',
          {
            opacity: 0,
            scale: 0.92,
            y: 20,
            duration: 0.6,
            stagger: 0.12,
          },
          '-=0.4'
        )
        .from(
          '.hero-stat-pill',
          {
            opacity: 0,
            y: 15,
            duration: 0.5,
            stagger: 0.08,
          },
          '-=0.3'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-14 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center overflow-hidden"
    >
      {/* Ambient Top Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Protocol Badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-6 shadow-md">
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        <span className="text-xs font-semibold tracking-wide text-gold-light uppercase">
          Menma Session Generator
        </span>
      </div>

      {/* 2. Headline with Split Lines */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
        <span className="hero-title-line block">
          Générez la session de votre bot <span className="text-gold">Menma-MD</span>
        </span>
        <span className="hero-title-line block text-neutral-300 font-medium text-2xl sm:text-4xl md:text-5xl mt-1">
          facilement depuis votre smartphone
        </span>
      </h1>

      {/* 3. Description */}
      <p className="hero-desc text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto mb-9 leading-relaxed">
        Associez votre compte WhatsApp à l&apos;aide d&apos;un <strong className="text-white font-semibold">Code de jumelage</strong> ou par <strong className="text-white font-semibold">Scan QR</strong> pour récupérer votre Session ID prêt à déployer.
      </p>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
        <Link
          href="/pair"
          className="hero-btn w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2.5 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="Obtenir un code de jumelage WhatsApp"
        >
          <KeyRound className="w-4.5 h-4.5 text-dark-950" />
          <span>CODE DE JUMELAGE</span>
          <ArrowRight className="w-4 h-4 text-dark-950" />
        </Link>

        <Link
          href="/qr"
          className="hero-btn w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/10 active:scale-95 text-white font-semibold text-sm border border-white/15 flex items-center justify-center gap-2.5 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="Scanner le QR code WhatsApp"
        >
          <QrCode className="w-4.5 h-4.5 text-gold" />
          <span>SCANNER LE QR CODE</span>
        </Link>
      </div>

      {/* 5. Trust / Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-400">
        <div className="hero-stat-pill flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Protocole Baileys</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span>Chiffrement de session</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
          <Smartphone className="w-4 h-4 text-gold" />
          <span>Multi-appareils</span>
        </div>
      </div>
    </section>
  );
}
