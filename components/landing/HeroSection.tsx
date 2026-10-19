'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { QrCode, KeyRound, Sparkles, ArrowRight, ShieldCheck, Smartphone, Globe } from 'lucide-react';
import InteractiveGlobe from '@/components/ui/InteractiveGlobe';
import MagneticButton from '@/components/ui/MagneticButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Entrance animation sequence
      tl.from('.hero-badge', {
        opacity: 0,
        y: -25,
        scale: 0.88,
        duration: 0.8,
      })
        .from(
          '.hero-title-line',
          {
            opacity: 0,
            y: 40,
            duration: 0.9,
            stagger: 0.15,
          },
          '-=0.5'
        )
        .from(
          '.hero-globe-wrapper',
          {
            opacity: 0,
            scale: 0.85,
            y: 30,
            duration: 1.1,
            ease: 'back.out(1.2)',
          },
          '-=0.6'
        )
        .from(
          '.hero-desc',
          {
            opacity: 0,
            y: 25,
            duration: 0.7,
          },
          '-=0.6'
        )
        .from(
          '.hero-btn-container',
          {
            opacity: 0,
            scale: 0.9,
            y: 25,
            duration: 0.7,
          },
          '-=0.4'
        )
        .from(
          '.hero-stat-pill',
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.4'
        );

      // Continuous Scroll-Driven Multi-Layer Parallax Scrubbing
      gsap.to('.hero-title-wrapper', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
        y: -60,
        opacity: 0.65,
        scale: 0.96,
      });

      gsap.to('.hero-globe-wrapper', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
        y: -100,
        scale: 1.1,
        rotationX: 15,
      });

      gsap.to('.hero-stat-pills-container', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
        y: 40,
        opacity: 0.8,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-10 pb-12 md:pt-16 md:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center overflow-hidden"
    >
      {/* Background Ambient Lighting Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-gradient-to-b from-gold/20 via-gold/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* 1. Protocol Badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 mb-6 shadow-xl backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-xs font-bold tracking-wide text-gold-light uppercase">
          Menma Session Generator 3.0
        </span>
      </div>

      {/* 2. Headline with Split Lines */}
      <div className="hero-title-wrapper mb-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
          <span className="hero-title-line block">
            Générez la session de votre bot <span className="text-gold underline decoration-gold/30 underline-offset-8">Menma-MD</span>
          </span>
          <span className="hero-title-line block text-neutral-300 font-medium text-xl sm:text-3xl md:text-4xl mt-2">
            facilement & instantanément depuis votre smartphone
          </span>
        </h1>
      </div>

      {/* 3. Flagship 3D Globe Feature */}
      <div className="hero-globe-wrapper relative my-2 sm:my-4">
        <InteractiveGlobe />
      </div>

      {/* 4. Description */}
      <p className="hero-desc text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
        Associez votre compte WhatsApp en quelques secondes grâce à notre protocole sécurisé multi-appareils Baileys. Récupérez votre <strong className="text-white font-semibold">Session ID</strong> prêt à être déployé.
      </p>

      {/* 5. Touch-First Action Buttons with Magnetic Feel */}
      <div className="hero-btn-container flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
        <Link href="/pair" className="w-full sm:w-auto">
          <MagneticButton
            ariaLabel="Obtenir un code de jumelage WhatsApp"
            className="w-full sm:w-auto min-h-[54px] px-7 py-3.5 rounded-2xl bg-gold hover:bg-gold-light text-dark-950 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(234,179,8,0.35)] flex items-center justify-center gap-3 transition-all"
          >
            <KeyRound className="w-4.5 h-4.5 text-dark-950" />
            <span>CODE DE JUMELAGE</span>
            <ArrowRight className="w-4 h-4 text-dark-950" />
          </MagneticButton>
        </Link>

        <Link href="/qr" className="w-full sm:w-auto">
          <MagneticButton
            ariaLabel="Scanner le QR code WhatsApp"
            className="w-full sm:w-auto min-h-[54px] px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm tracking-wider uppercase border border-white/20 backdrop-blur-xl flex items-center justify-center gap-3 transition-all"
          >
            <QrCode className="w-4.5 h-4.5 text-gold" />
            <span>SCANNER LE QR CODE</span>
          </MagneticButton>
        </Link>
      </div>

      {/* 6. Trust / Feature Pills */}
      <div className="hero-stat-pills-container flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-neutral-400">
        <div className="hero-stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-neutral-200">Protocole Baileys</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-medium text-neutral-200">Chiffrement AES-256</span>
        </div>
        <div className="hero-stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
          <Globe className="w-4 h-4 text-gold" />
          <span className="font-medium text-neutral-200">Réseau Cloud 24/7</span>
        </div>
      </div>
    </section>
  );
}
