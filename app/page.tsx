import HeroSection from '@/components/landing/HeroSection';
import MobileInteractiveCards from '@/components/landing/MobileInteractiveCards';
import LiveTerminalDemo from '@/components/landing/LiveTerminalDemo';
import { Smartphone, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section with GSAP Animations */}
      <HeroSection />

      {/* 2. Interactive Feature Bento Cards */}
      <MobileInteractiveCards />

      {/* 3. Real-Time Terminal Simulation */}
      <LiveTerminalDemo />

      {/* 4. Mobile-first Highlights Banner */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto py-8 mb-16">
        <div className="glass-panel-accent rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Optimisation 100% Mobile</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Une expérience fluide directement depuis votre smartphone
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 mb-8 leading-relaxed">
              Plus besoin de terminal Linux ou de PC. Tout le processus d&apos;appairage, de scan et de configuration est conçu pour être exécuté au bout de vos doigts en un clin d&apos;œil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Zéro Latence</h4>
                  <p className="text-xs text-neutral-400">Connexion instantanée au handshake Baileys v7.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Chiffrement Clé</h4>
                  <p className="text-xs text-neutral-400">Vos identifiants ne sont jamais stockés en clair.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Anti-Sommeil</h4>
                  <p className="text-xs text-neutral-400">Pinger intégré pour maintenir le serveur actif 24/7.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
