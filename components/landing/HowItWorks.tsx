'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Smartphone, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Choisissez votre méthode',
    desc: 'Optez pour le code de jumelage avec votre numéro ou le QR Code pour relier votre session.',
    badge: 'Code ou QR',
  },
  {
    num: '02',
    title: 'Validez sur WhatsApp',
    desc: 'Ouvrez WhatsApp > Paramètres > Appareils connectés, puis saisissez le code ou scannez le QR affiché.',
    badge: 'Liaison instantanée',
  },
  {
    num: '03',
    title: 'Récupérez votre Session ID',
    desc: 'Votre identifiant est envoyé directement dans votre propre discussion WhatsApp. Copiez-le pour votre bot.',
    badge: 'Prêt à l\'emploi',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.how-header', {
        scrollTrigger: {
          trigger: '.how-header',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('.how-step-card', {
        scrollTrigger: {
          trigger: '.how-steps-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 35,
        stagger: 0.15,
        duration: 0.75,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-12 mb-20">
      <div className="how-header text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-3">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Guide Rapide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Comment ça fonctionne ?
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto">
          Trois étapes simples pour initialiser votre bot Menma-MD sans aucune configuration technique compliquée.
        </p>
      </div>

      <div className="how-steps-grid grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="how-step-card glass-panel rounded-2xl p-6 border border-white/5 relative flex flex-col justify-between hover:border-gold/30 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-3xl font-black text-gold/30 group-hover:text-gold transition-colors">
                  {step.num}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                  {step.badge}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-gold-light transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Étape simple & guidée</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pair"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-dark-950 font-bold text-xs tracking-wider uppercase transition-all active:scale-95 touch-scale shadow-lg"
        >
          <span>Démarrer maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
