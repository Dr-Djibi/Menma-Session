'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const QUICK_PREFIXES = [
  { code: '224', country: 'Guinée (GN)', flag: '🇬🇳' },
  { code: '225', country: "Côte d'Ivoire (CI)", flag: '🇨🇮' },
  { code: '221', country: 'Sénégal (SN)', flag: '🇸🇳' },
  { code: '33', country: 'France (FR)', flag: '🇫🇷' },
  { code: '237', country: 'Cameroun (CM)', flag: '🇨🇲' },
  { code: '228', country: 'Togo (TG)', flag: '🇹🇬' },
  { code: '229', country: 'Bénin (BJ)', flag: '🇧🇯' },
  { code: '243', country: 'RDC (CD)', flag: '🇨🇩' },
  { code: '212', country: 'Maroc (MA)', flag: '🇲🇦' },
  { code: '1', country: 'USA / Canada', flag: '🇺🇸' },
];

export default function PairPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'code' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pairCode, setPairCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  // GSAP animation with ScrollTrigger
  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>('.pair-animate');
      elements.forEach((el, index) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 25, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  };

  const handleGetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      setErrorMessage('Veuillez entrer un numéro international valide (au moins 8 chiffres).');
      setStatus('error');
      triggerHaptic(50);
      return;
    }

    setStatus('generating');
    setErrorMessage('');
    setPairCode('');
    setSessionId('');
    setCountdown(120);
    triggerHaptic(20);

    try {
      const res = await fetch(`/api/pair?number=${cleanNumber}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Impossible de générer le code.');
      }

      setPairCode(data.code || '');
      setPollingId(data.id || null);
      setStatus('code');
      triggerHaptic([20, 40, 20]);
    } catch (err: any) {
      console.error('[Pair Request Error]:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors de la connexion.');
      setStatus('error');
      triggerHaptic(50);
    }
  };

  useEffect(() => {
    if (status !== 'code' || !pollingId) return;

    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/pair/status/${pollingId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'success' && data.session) {
          setSessionId(data.session);
          setStatus('success');
          triggerHaptic([40, 60, 100]);
        } else if (data.status === 'error') {
          setErrorMessage('La session de jumelage a échoué ou a expiré. Veuillez réessayer.');
          setStatus('error');
          triggerHaptic(60);
        }
      } catch (err) {
        console.error('[Poll Error]:', err);
      }
    };

    pollInterval = setInterval(checkStatus, 2500);

    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, pollingId]);

  const copyPairCode = () => {
    if (!pairCode) return;
    navigator.clipboard?.writeText(pairCode.replace(/-/g, ''));
    setCopiedCode(true);
    triggerHaptic(30);
    showToast('Code de jumelage copié !');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard?.writeText(sessionId);
    setCopiedSession(true);
    triggerHaptic(30);
    showToast('Session ID copié dans le presse-papier !');
    setTimeout(() => setCopiedSession(false), 2500);
  };

  const resetForm = () => {
    setStatus('idle');
    setPairCode('');
    setSessionId('');
    setErrorMessage('');
    setPollingId(null);
  };

  const codeChars = pairCode ? pairCode.replace(/[^A-Za-z0-9]/g, '').split('') : [];

  return (
    <div ref={containerRef} className="px-4 sm:px-6 max-w-xl mx-auto py-8 pb-28">
      {/* Header Back Link */}
      <div className="pair-animate mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-scale"
          aria-label="Retour à la page d'accueil"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR À L&apos;ACCUEIL</span>
        </Link>
      </div>

      {/* Main Glass Card */}
      <div className="pair-animate glass-panel-accent rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10">
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3 shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Code de Jumelage
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Reliez votre compte WhatsApp en tapant le code à 8 caractères sur votre téléphone.
          </p>
        </div>

        {/* ── STATE 1: IDLE / FORMULAIRE ── */}
        {status === 'idle' && (
          <form onSubmit={handleGetCode} className="space-y-5">
            {/* Quick Country Chips */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                Indicatifs fréquents :
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {QUICK_PREFIXES.map((item) => (
                  <button
                    type="button"
                    key={item.code}
                    aria-label={`Insérer l'indicatif +${item.code} (${item.country})`}
                    onClick={() => {
                      setPhoneNumber(item.code);
                      triggerHaptic(10);
                      phoneInputRef.current?.focus();
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/20 text-xs text-neutral-200 border border-white/10 flex items-center gap-1.5 flex-shrink-0 touch-scale transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span aria-hidden="true">{item.flag}</span>
                    <span className="font-mono font-semibold">+{item.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="pair-phone-input"
                className="text-xs font-semibold text-neutral-300 block uppercase tracking-wide"
              >
                Numéro WhatsApp International <span className="text-gold">*</span>
              </label>
              <input
                ref={phoneInputRef}
                id="pair-phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Ex : 224625968097"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-13 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-lg tracking-wider placeholder:text-neutral-600 outline-none transition-all"
                aria-required="true"
                aria-label="Numéro WhatsApp International"
                required
              />
              <p className="text-[11px] text-neutral-400">
                Saisissez l&apos;indicatif pays sans le signe &apos;+&apos;, espaces ou tirets.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Obtenir le code de jumelage WhatsApp"
            >
              <KeyRound className="w-4.5 h-4.5 text-dark-950" />
              <span>OBTENIR LE CODE DE JUMELAGE</span>
            </button>
          </form>
        )}

        {/* ── STATE 2: GÉNÉRATION EN COURS ── */}
        {status === 'generating' && (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gold animate-spin" />
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-ping opacity-30" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Initialisation Baileys Multi-Device...
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Connexion sécurisée aux serveurs WhatsApp et négociation de la clé d&apos;appairage.
            </p>
            <div className="mt-6 w-48 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gold shimmer-box w-full" />
            </div>
          </div>
        )}

        {/* ── STATE 3: CODE DE JUMELAGE AFFICHÉ ── */}
        {status === 'code' && (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Code WhatsApp Actif</span>
            </div>

            {/* 8-character segmented visual boxes */}
            <div
              className="py-2"
              role="region"
              aria-label={`Code de jumelage généré : ${pairCode}`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {codeChars.map((char, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-9 h-12 sm:w-11 sm:h-14 rounded-xl bg-black/60 border-2 border-gold/40 text-gold-light font-mono text-xl sm:text-2xl font-black flex items-center justify-center shadow-lg transform transition-transform">
                      {char}
                    </span>
                    {index === 3 && (
                      <span className="text-neutral-500 font-mono text-xl mx-1 font-bold">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyPairCode}
              className={`w-full min-h-[50px] rounded-2xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                copiedCode
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gold/20 hover:bg-gold/30 text-gold-light border border-gold/30'
              }`}
              aria-label="Copier le code de jumelage"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'CODE COPIÉ DANS LE PRESSE-PAPIER !' : 'COPIER LE CODE (1-TAP)'}</span>
            </button>

            {/* Instructions Box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
                  <span className="text-xs font-bold text-white">En attente de liaison</span>
                </div>
                <span className="text-xs font-mono text-neutral-400">{countdown}s</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                1. Ouvrez WhatsApp &gt; <strong>Appareils connectés</strong> &gt; <strong>Connecter un appareil</strong>.<br />
                2. Saisissez ce code à 8 caractères sur votre téléphone.
              </p>
            </div>

            <button
              onClick={resetForm}
              className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors touch-scale py-2"
              aria-label="Recommencer avec un autre numéro"
            >
              Recommencer avec un autre numéro
            </button>
          </div>
        )}

        {/* ── STATE 4: SUCCESS ── */}
        {status === 'success' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LIAISON EFFECTUÉE AVEC SUCCÈS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Votre Session ID est prêt !
              </h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Sauvegardez cette clé pour la renseigner dans votre fichier <code>.env</code> ou sur votre hébergeur (Koyeb, Render, Heroku).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-left relative overflow-hidden">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Clé de Session ID (MENMA-MD)
              </span>
              <div className="font-mono text-xs text-gold break-all bg-black/40 p-3 rounded-xl border border-white/5 select-all">
                {sessionId}
              </div>
            </div>

            <button
              onClick={copySessionId}
              className={`w-full min-h-[52px] rounded-2xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                copiedSession
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gold hover:bg-gold-light text-dark-950'
              }`}
              aria-label="Copier la clé de session"
            >
              {copiedSession ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSession ? 'SESSION ID COPIÉ !' : 'COPIER LA CLÉ DE SESSION'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/env"
                className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center justify-center gap-1.5 touch-scale min-h-[44px]"
                aria-label="Aller au générateur .env"
              >
                <span>Générer .ENV</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </Link>
              <button
                onClick={resetForm}
                className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10 touch-scale min-h-[44px]"
                aria-label="Nouveau jumelage"
              >
                Nouveau jumelage
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 5: ERROR ── */}
        {status === 'error' && (
          <div className="py-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 mx-auto flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">Échec du jumelage</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={resetForm}
              className="w-full min-h-[50px] rounded-2xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Réessayer la demande de code"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RÉESSAYER AVEC MON NUMÉRO</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Reassurance */}
      <div className="pair-animate mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Chiffrement Baileys AES-256 • Protocole Multi-Appareils sécurisé.</span>
      </div>
    </div>
  );
}
