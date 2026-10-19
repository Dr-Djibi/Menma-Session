'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Zap, ShieldCheck, Clock, Cpu } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

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
      const cards = gsap.utils.toArray<HTMLElement>('.stat-card-wrapper');

      // Staggered scrub timeline linked directly to scroll progress
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 0.8,
        },
      });

      cards.forEach((card, index) => {
        tl.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.9, rotationX: 15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            ease: 'power3.out',
            duration: 0.8,
          },
          index * 0.15
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-6 mb-12 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="stat-card-wrapper">
              <TiltCard className="p-4 sm:p-5 h-full flex flex-col justify-between shadow-xl group border-white/10 hover:border-gold/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-xl bg-gold/15 text-gold inline-flex border border-gold/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/10">
                    Live
                  </span>
                </div>
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 group-hover:text-gold transition-colors">
                    {item.display}
                  </div>
                  <div className="text-xs font-bold text-neutral-200 mb-0.5">{item.label}</div>
                  <div className="text-[11px] text-neutral-400 leading-snug">{item.desc}</div>
                </div>
              </TiltCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}
