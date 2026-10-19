import HeroSection from '@/components/landing/HeroSection';
import StatsCounter from '@/components/landing/StatsCounter';
import HowItWorks from '@/components/landing/HowItWorks';
import MobileInteractiveCards from '@/components/landing/MobileInteractiveCards';
import LiveTerminalDemo from '@/components/landing/LiveTerminalDemo';
import FaqSection from '@/components/landing/FaqSection';
import ScrollToTop from '@/components/ui/ScrollToTop';
import AmbientParticleCanvas from '@/components/ui/AmbientParticleCanvas';
import TiltCard from '@/components/ui/TiltCard';
import { Smartphone, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative flex flex-col overflow-hidden min-h-screen">
      {/* Continuous Floating Ambient Particle Background Canvas */}
      <AmbientParticleCanvas />

      {/* 1. Hero Section with 3D Globe & Multi-layer GSAP Parallax */}
      <HeroSection />

      {/* Section Reveal Divider Line */}
      <div className="w-full max-w-5xl mx-auto px-6 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* 2. Key Metrics & Animated Tilt Cards */}
      <StatsCounter />

      {/* Section Reveal Divider Line */}
      <div className="w-full max-w-5xl mx-auto px-6 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* 3. Step-by-Step Guide with GSAP Scrubbing */}
      <HowItWorks />

      {/* Section Reveal Divider Line */}
      <div className="w-full max-w-5xl mx-auto px-6 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* 4. Interactive Feature Bento Cards */}
      <MobileInteractiveCards />

      {/* Section Reveal Divider Line */}
      <div className="w-full max-w-5xl mx-auto px-6 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* 5. Real-Time Terminal Simulation */}
      <LiveTerminalDemo />

      {/* Section Reveal Divider Line */}
      <div className="w-full max-w-5xl mx-auto px-6 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* 6. FAQ Section */}
      <FaqSection />

      {/* 7. Highlights Banner with Interactive Tilt */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto py-4 mb-10 relative z-10">
        <TiltCard className="p-6 sm:p-10 text-center border-gold/30 bg-gold/[0.03]">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider mb-4 shadow-md">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Confort d&apos;utilisation Mobile First</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Une interface pensée pour tous vos appareils
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 mb-8 leading-relaxed">
              Tout le processus d&apos;appairage, de scan et de configuration est conçu pour être fluide et instantané aussi bien sur smartphone que sur tablette ou ordinateur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/15 text-gold flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Connexion rapide</h4>
                  <p className="text-xs text-neutral-400">Handshake Baileys direct sans étape superflue.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/15 text-gold flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Sécurité respectée</h4>
                  <p className="text-xs text-neutral-400">Vos identifiants ne sont jamais sauvegardés en clair.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold/15 text-gold flex-shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Maintien actif</h4>
                  <p className="text-xs text-neutral-400">Service disponible 24/7 avec pinger automatique.</p>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* 8. Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}
