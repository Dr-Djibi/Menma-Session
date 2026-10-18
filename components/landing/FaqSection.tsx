'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, HelpCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'Qu\'est-ce que le Session ID et à quoi sert-il ?',
    a: 'Le Session ID est une clé unique et sécurisée générée lors de l\'association de votre compte WhatsApp. Elle permet à votre bot Menma-MD de se connecter et de répondre sans avoir à stocker votre mot de passe ni à rescanner à chaque redémarrage.',
  },
  {
    q: 'Quelle est la différence entre le code de jumelage et le QR code ?',
    a: 'Le code de jumelage (Pairing) permet de saisir un code à 8 chiffres directement sur le même smartphone, idéal quand vous n\'avez qu\'un seul téléphone. Le QR code est pratique si vous visualisez la page sur un ordinateur ou une tablette pour le scanner avec votre caméra WhatsApp.',
  },
  {
    q: 'Mes identifiants et mes discussions sont-ils en sécurité ?',
    a: 'Oui. Le générateur utilise la bibliothèque officielle Baileys. Les clés de session temporaires sont envoyées directement dans votre discussion WhatsApp personnelle (« Vous ») puis purgées de la mémoire. Aucun message privé n\'est lu ni conservé sur le serveur.',
  },
  {
    q: 'Où dois-je coller mon Session ID une fois reçu ?',
    a: 'Dans votre fichier de configuration .env à la ligne SESSION_ID="votre_code", ou dans les variables d\'environnement de votre hébergeur (Koyeb, Render, Heroku ou VPS). Vous pouvez également utiliser notre générateur .ENV intégré.',
  },
  {
    q: 'Que faire si le code expire ou n\'arrive pas ?',
    a: 'Vérifiez que votre numéro WhatsApp est saisi avec son indicatif international (ex: 221... ou 33...) sans espaces ni symboles (+). Si le délai expire, rechargez simplement la page pour demander un nouveau code.',
  },
];

export default function FaqSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(
    () => {
      gsap.from('.faq-header', {
        scrollTrigger: {
          trigger: '.faq-header',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('.faq-card', {
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 25,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section ref={containerRef} className="px-4 sm:px-6 max-w-4xl mx-auto py-12 mb-20">
      <div className="faq-header text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Foire Aux Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Questions Fréquentes
        </h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Tout ce qu&apos;il faut savoir pour lier votre bot Menma-MD en toute sérénité.
        </p>
      </div>

      <div className="faq-list space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`faq-card glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen ? 'border-gold/40 bg-gold/[0.03]' : 'border-white/5 hover:border-white/15'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 select-none touch-scale"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base text-white">
                  {item.q}
                </span>
                <span
                  className={`p-1.5 rounded-lg bg-white/5 text-neutral-300 transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-gold bg-gold/15' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 mt-1 pt-3 animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
