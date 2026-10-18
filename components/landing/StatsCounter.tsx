'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ShieldCheck, Clock, Cpu } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface StatItem {
  target: number;
  suffix: string;
  prefix?: string;
  label: string;
  desc: string;
  icon: typeof Zap;
}

const stats: StatItem[] = [
  {
    target: 2,
    suffix: '',
    prefix: '',
    label: 'Modes de connexion',
    desc: 'Code de jumelage ou scan QR selon vos besoins',
    icon: Cpu,
  },
  {
    target: 10,
    suffix: 's',
    prefix: '< ',
    label: 'Temps moyen',
    desc: 'Génération et envoi direct du Session ID',
    icon: Clock,
  },
  {
    target: 100,
    suffix: '%',
    prefix: '',
    label: 'Baileys Multi-Device',
    desc: 'Protocole standardisé sans déconnexion',
    icon: ShieldCheck,
  },
  {
    target: 24,
    suffix: '/7',
    prefix: '',
    label: 'Disponibilité',
    desc: 'Service maintenu actif avec pinger automatique',
    icon: Zap,
  },
];

export default function StatsCounter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const counters = containerRef.current?.querySelectorAll('.stat-number');
      if (!counters) return;

      counters.forEach((counter) => {
        const targetVal = parseFloat(counter.getAttribute('data-target') || '0');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';

        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: counter,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            counter.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
          },
        });
      });

      gsap.from('.stat-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="stat-card glass-panel rounded-2xl p-4 sm:p-5 border border-white/5 flex flex-col justify-between hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-gold/10 text-gold inline-flex">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div
                  className="stat-number font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1"
                  data-target={item.target}
                  data-prefix={item.prefix}
                  data-suffix={item.suffix}
                >
                  {item.prefix}0{item.suffix}
                </div>
                <div className="text-xs font-semibold text-neutral-200 mb-0.5">{item.label}</div>
                <div className="text-[11px] text-neutral-400 leading-snug">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
