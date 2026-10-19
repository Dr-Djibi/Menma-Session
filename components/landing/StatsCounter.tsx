'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Zap, ShieldCheck, Clock, Cpu } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface StatItem {
  target: number;
  suffix: string;
  prefix?: string;
  display: string;
  label: string;
  desc: string;
  icon: typeof Zap;
}

const stats: StatItem[] = [
  {
    target: 2,
    suffix: '',
    prefix: '',
    display: '2',
    label: 'Modes de connexion',
    desc: 'Code de jumelage ou scan QR selon vos besoins',
    icon: Cpu,
  },
  {
    target: 10,
    suffix: 's',
    prefix: '< ',
    display: '< 10s',
    label: 'Temps moyen',
    desc: 'Génération et envoi direct du Session ID',
    icon: Clock,
  },
  {
    target: 100,
    suffix: '%',
    prefix: '',
    display: '100%',
    label: 'Baileys Multi-Device',
    desc: 'Protocole standardisé sans déconnexion',
    icon: ShieldCheck,
  },
  {
    target: 24,
    suffix: '/7',
    prefix: '',
    display: '24/7',
    label: 'Disponibilité',
    desc: 'Service maintenu actif en continu',
    icon: Zap,
  },
];

export default function StatsCounter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.stat-card');

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-4 mb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="stat-card glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between hover:border-gold/40 transition-colors shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-gold/10 text-gold inline-flex border border-gold/20">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  {item.display}
                </div>
                <div className="text-xs font-bold text-neutral-200 mb-0.5">{item.label}</div>
                <div className="text-[11px] text-neutral-400 leading-snug">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
