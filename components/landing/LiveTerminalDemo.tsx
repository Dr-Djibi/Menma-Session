'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const mockLogs = [
  { time: '14:02:11', text: '[BAILEYS] Initialisation du socket WhatsApp multi-device...', type: 'info' },
  { time: '14:02:12', text: '[AUTH] Chargement des clés authState depuis temp/session...', type: 'info' },
  { time: '14:02:13', text: '[PAIRING] Demande de code générée avec succès : MENMA-7749', type: 'gold' },
  { time: '14:02:18', text: '[SOCKET] Handshake WhatsApp validé (connection.update: open)', type: 'success' },
  { time: '14:02:19', text: '[PASTEBIN] Envoi sécurisé des credentials chiffrés...', type: 'info' },
  { time: '14:02:20', text: '[SESSION] Session ID généré : Menma_md_8fbc7291a...', type: 'gold' },
  { time: '14:02:22', text: '[PINGER] Bot enregistré dans PostgreSQL (is_online: true)', type: 'success' },
];

export default function LiveTerminalDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useGSAP(
    () => {
      gsap.fromTo(
        '.terminal-wrapper',
        { opacity: 0, y: 35, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.terminal-wrapper',
            start: 'top 85%',
          },
        }
      );
      startTyping();
    },
    { scope: sectionRef }
  );

  function startTyping() {
    setVisibleCount(0);
    if (tlRef.current) tlRef.current.kill();

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tlRef.current = tl;

    mockLogs.forEach((_, i) => {
      tl.call(
        () => setVisibleCount(i + 1),
        undefined,
        i * 1.1
      );
    });

    tl.call(() => setVisibleCount(0), undefined, mockLogs.length * 1.1 + 1.5);
  }

  return (
    <section ref={sectionRef} className="px-4 sm:px-6 max-w-4xl mx-auto py-4 mb-12">
      <div className="terminal-wrapper glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-black/70 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-gold" />
              <span>menma-session.log</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
            <RefreshCw className="w-3 h-3 text-gold animate-spin" />
            <span className="hidden sm:inline">Flux temps réel</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 sm:p-5 bg-black/85 font-mono text-xs sm:text-sm min-h-[220px] max-h-[280px] overflow-y-auto flex flex-col gap-2">
          {mockLogs.slice(0, visibleCount).map((log, index) => (
            <div
              key={index}
              className="terminal-log-line flex items-start gap-2.5 leading-relaxed"
              style={{ animation: 'fadeInLog 0.3s ease forwards' }}
            >
              <span className="text-neutral-500 text-[11px] sm:text-xs select-none flex-shrink-0">{log.time}</span>
              <span
                className={`break-all ${
                  log.type === 'gold'
                    ? 'text-gold font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-300'
                }`}
              >
                {log.text}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-gold font-bold">&gt;</span>
            <span className="w-2 h-4 bg-gold animate-pulse inline-block" />
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="px-4 py-2.5 bg-black/50 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maintien en ligne continu • Moteur Baileys</span>
          </div>
          <span className="font-mono text-neutral-500">Node.js • Baileys Engine</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLog {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
