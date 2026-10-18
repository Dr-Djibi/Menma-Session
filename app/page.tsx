import HeroSection from '@/components/landing/HeroSection';
import StatsCounter from '@/components/landing/StatsCounter';
import HowItWorks from '@/components/landing/HowItWorks';
import MobileInteractiveCards from '@/components/landing/MobileInteractiveCards';
import LiveTerminalDemo from '@/components/landing/LiveTerminalDemo';
import FaqSection from '@/components/landing/FaqSection';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Smartphone, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section with GSAP Animations */}
      <HeroSection />

      {/* 2. Key Metrics & Animated Counters */}
      <StatsCounter />

      {/* 3. Step-by-Step Guide */}
      <HowItWorks />

      {/* 4. Interactive Feature Bento Cards */}
      <MobileInteractiveCards />

      {/* 5. Real-Time Terminal Simulation */}
      <LiveTerminalDemo />

      {/* 6. FAQ Section */}
      <FaqSection />

      {/* 7. Highlights Banner */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto py-8 mb-16">
        <div className="glass-panel-accent rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Confort d&apos;utilisation</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Une interface pensée pour tous vos appareils
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 mb-8 leading-relaxed">
              Tout le processus d&apos;appairage, de scan et de configuration est conçu pour être accessible aussi bien sur smartphone que sur tablette ou ordinateur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Connexion rapide</h4>
                  <p className="text-xs text-neutral-400">Handshake Baileys direct sans étape superflue.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Sécurité respectée</h4>
                  <p className="text-xs text-neutral-400">Vos identifiants ne sont jamais sauvegardés en clair.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Maintien actif</h4>
                  <p className="text-xs text-neutral-400">Service disponible 24/7 avec pinger automatique.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}
