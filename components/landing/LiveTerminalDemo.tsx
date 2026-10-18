'use client';

import { useState, useEffect } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

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
  const [logs, setLogs] = useState(mockLogs.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % (mockLogs.length + 1);
        if (next === 0) {
          setLogs(mockLogs.slice(0, 2));
          return 2;
        }
        setLogs(mockLogs.slice(0, next));
        return next;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto py-8 mb-24">
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
              <Terminal className="w-3.5 h-3.5 text-gold" />
              <span>menma-protocol-live.log</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
            <RefreshCw className="w-3 h-3 text-gold animate-spin" />
            <span className="hidden sm:inline">Flux temps réel</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 sm:p-5 bg-black/80 font-mono text-xs sm:text-sm min-h-[220px] max-h-[280px] overflow-y-auto flex flex-col gap-2">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-neutral-500 text-[11px] sm:text-xs select-none">{log.time}</span>
              <span
                className={`break-all ${
                  log.type === 'gold'
                    ? 'text-gold font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-400'
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

        {/* Terminal Footer info */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-mise en veille active (Self-Ping 4 min)</span>
          </div>
          <span className="font-mono text-neutral-500">Node.js 26 • Baileys Engine</span>
        </div>
      </div>
    </section>
  );
}
