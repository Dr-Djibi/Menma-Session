'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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
      // Header Scrub Animation
      gsap.fromTo(
        '.how-header',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.how-header',
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.6,
          },
        }
      );

      // Cards Scrub Timeline
      const cards = gsap.utils.toArray<HTMLElement>('.how-step-card-wrapper');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 0.8,
        },
      });

      cards.forEach((card, index) => {
        tl.fromTo(
          card,
          { opacity: 0, y: 45, scale: 0.92, rotationY: -10 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            ease: 'power3.out',
            duration: 0.8,
          },
          index * 0.2
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-8 mb-12 relative z-10">
      <div className="how-header text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider mb-3 shadow-lg">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Guide Rapide Mobile</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Comment ça fonctionne ?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
          Trois étapes simples et fluides pour initialiser votre bot Menma-MD sans configuration technique.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, idx) => (
          <div key={idx} className="how-step-card-wrapper">
            <TiltCard className="p-6 h-full flex flex-col justify-between group shadow-xl border-white/10 hover:border-gold/40">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-3xl font-black text-gold/40 group-hover:text-gold transition-colors">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 font-semibold">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold-light transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Étape guidée & instantanée</span>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
