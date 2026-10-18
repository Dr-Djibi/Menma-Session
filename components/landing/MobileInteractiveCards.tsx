'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KeyRound, QrCode, FileCode2, Copy, Check, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MobileInteractiveCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [copiedDemo, setCopiedDemo] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useGSAP(
    () => {
      // Titre de section
      gsap.from('.cards-heading', {
        scrollTrigger: {
          trigger: '.cards-heading',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power3.out',
      });

      // Cartes avec stagger au scroll
      gsap.from('.interactive-card', {
        scrollTrigger: {
          trigger: '.interactive-card',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        scale: 0.97,
        stagger: 0.14,
        duration: 0.75,
        ease: 'power3.out',
      });

      // Hover magnetic effect sur les cartes (desktop)
      document.querySelectorAll('.interactive-card').forEach((card) => {
        const el = card as HTMLElement;
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { y: -4, scale: 1.01, duration: 0.3, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
        });
      });
    },
    { scope: sectionRef }
  );

  const copyDemoCode = () => {
    navigator.clipboard?.writeText('MENMA-7749');
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <section ref={sectionRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-8 mb-20">
      <div className="cards-heading text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Méthodes de connexion simples
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto">
          Générez votre session directement depuis votre téléphone ou un navigateur web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARTE 1: CODE PAIRING */}
        <div className="interactive-card glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-gold/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-gold/10 text-gold-light border border-gold/20 font-semibold">
                Simple & direct
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">Code de Jumelage (Pairing)</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4 leading-relaxed">
              Entrez votre numéro WhatsApp avec l&apos;indicatif pays. Recevez un code à 8 chiffres à valider dans WhatsApp &gt; Appareils connectés.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-0.5">
                  Exemple de format
                </span>
                <span className="font-mono text-base font-bold text-gold tracking-widest">
                  MENMA-7749
                </span>
              </div>
              <button
                onClick={copyDemoCode}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-xs text-neutral-300 flex items-center gap-1.5 transition-colors touch-scale"
                aria-label="Copier l'exemple de code"
              >
                {copiedDemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDemo ? 'Copié' : 'Tester'}</span>
              </button>
            </div>
          </div>

          <Link
            href="/pair"
            className="w-full min-h-[46px] rounded-xl bg-gold/15 hover:bg-gold/25 active:scale-95 text-gold-light font-semibold text-xs tracking-wide border border-gold/30 flex items-center justify-center gap-1.5 transition-all touch-scale"
          >
            <span>GÉNÉRER UN CODE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARTE 2: SCAN QR */}
        <div className="interactive-card glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-gold/40 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 font-medium">
                Scan caméra
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">Scan QR Code</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4 leading-relaxed">
              Affichez le code QR et scannez-le avec votre application WhatsApp. Particulièrement pratique depuis un ordinateur ou une tablette.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-4 flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden flex-shrink-0">
                <QrCode className="w-7 h-7 text-gold opacity-80" />
                <div className="absolute inset-x-0 h-0.5 bg-gold animate-pulse top-1/2 -translate-y-1/2 shadow-sm" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Mise à jour automatique</span>
                <span className="text-[11px] text-neutral-400 block">QR code actualisé en continu</span>
              </div>
            </div>
          </div>

          <Link
            href="/qr"
            className="w-full min-h-[46px] rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-semibold text-xs tracking-wide border border-white/15 flex items-center justify-center gap-1.5 transition-all touch-scale"
          >
            <span>OUVRIR LE SCANNER QR</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </div>

        {/* CARTE 3: GÉNÉRATEUR .ENV */}
        <div className="interactive-card md:col-span-2 glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-gold/40 transition-colors flex flex-col justify-between">
          <div className="md:flex md:items-start md:gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                  Configuration guidée
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5">Générateur de Fichier .ENV</h3>
              <p className="text-xs sm:text-sm text-neutral-400 mb-4 leading-relaxed">
                Renseignez vos options (Session ID, numéro administrateur, base de données, etc.) et téléchargez votre fichier .env prêt à déployer.
              </p>
            </div>

            {/* Stepper micro-preview */}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-black/40 border border-white/10 mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all touch-scale ${
                      activeStep === step
                        ? 'bg-gold text-dark-950 shadow-sm'
                        : 'text-neutral-400 hover:text-white bg-white/5'
                    }`}
                  >
                    Étape {step}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 text-center mb-4">
                {activeStep === 1 && '1. Session ID & Numéro Owner'}
                {activeStep === 2 && '2. Base de données PostgreSQL'}
                {activeStep === 3 && '3. Options & Chatbot'}
                {activeStep === 4 && '4. Exportation du fichier'}
              </p>
            </div>
          </div>

          <Link
            href="/env"
            className="w-full min-h-[46px] rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-semibold text-xs tracking-wide border border-white/15 flex items-center justify-center gap-1.5 transition-all touch-scale"
          >
            <span>CRÉER MON FICHIER .ENV</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
