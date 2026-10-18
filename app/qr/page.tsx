'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  QrCode,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function QRPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrId, setQrId] = useState<string>('');
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copiedSession, setCopiedSession] = useState(false);
  const [countdown, setCountdown] = useState(45);

  useGSAP(
    () => {
      gsap.from('.qr-animate', {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
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

  // Generate unique ID and start session
  const startQrSession = () => {
    const newId = Math.random().toString(36).substring(2, 12);
    setQrId(newId);
    setStatus('loading');
    setQrImageSrc(`/api/qr?id=${newId}&t=${Date.now()}`);
    setErrorMessage('');
    setSessionId('');
    setCountdown(45);
    triggerHaptic(20);
  };

  useEffect(() => {
    startQrSession();
  }, []);

  // Poll status of QR scan
  useEffect(() => {
    if (!qrId || status === 'success') return;

    let pollTimer: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/qr/status/${qrId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'success' && data.session) {
          setSessionId(data.session);
          setStatus('success');
          triggerHaptic([40, 60, 100]);
        } else if (data.status === 'error') {
          setErrorMessage('Session QR expirée ou rejetée. Veuillez rafraîchir.');
          setStatus('error');
          triggerHaptic(50);
        }
      } catch (err) {
        console.error('[QR Poll Error]:', err);
      }
    };

    pollTimer = setInterval(checkStatus, 2500);

    // Auto-refresh timer
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          startQrSession();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollTimer);
      clearInterval(countTimer);
    };
  }, [qrId, status]);

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard?.writeText(sessionId);
    setCopiedSession(true);
    triggerHaptic(30);
    setTimeout(() => setCopiedSession(false), 2500);
  };

  return (
    <div ref={containerRef} className="px-4 sm:px-6 max-w-xl mx-auto py-8 pb-28">
      {/* Back navigation */}
      <div className="qr-animate mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-scale"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR À L&apos;ACCUEIL</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="qr-animate glass-panel-accent rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl text-center">
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3 shadow-lg">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scanner le QR Code
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
            Scannez directement ce QR Code depuis WhatsApp sur un autre appareil pour lier votre session.
          </p>
        </div>

        {/* ── STATE 1: SCANNER EN COURS (LOADING OU READY) ── */}
        {status !== 'success' && status !== 'error' && (
          <div className="space-y-6">
            {/* QR Canvas Box with Laser Scan Beam */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-3xl bg-black/70 border-2 border-gold/40 p-4 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />

              {/* Animated laser scan bar */}
              <div className="animate-laser-scan z-20" />

              {/* Image QR */}
              {qrImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrImageSrc}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain rounded-xl relative z-10"
                  onLoad={() => setStatus('ready')}
                  onError={() => {
                    setStatus('loading');
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gold gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-mono text-neutral-400">Génération du flux QR...</span>
                </div>
              )}
            </div>

            {/* Auto-refresh countdown indicator */}
            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
                <RefreshCw className="w-3.5 h-3.5 text-gold animate-spin" />
                <span>Auto-refresh dans {countdown}s</span>
              </div>

              <button
                onClick={startQrSession}
                className="px-3 py-1.5 rounded-full bg-gold/15 hover:bg-gold/25 text-xs text-gold font-semibold border border-gold/30 transition-colors touch-scale"
              >
                Actualiser
              </button>
            </div>

            {/* Mobile Single Phone Tip */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gold/10 text-gold flex-shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-white block mb-0.5">Vous utilisez un seul smartphone ?</strong>
                <p className="text-neutral-400 leading-relaxed mb-2">
                  Il est difficile de scanner un écran avec le même téléphone. Utilisez plutôt le <strong>Code de Couplage</strong> à 8 caractères.
                </p>
                <Link
                  href="/pair"
                  className="inline-flex items-center gap-1.5 text-gold font-semibold hover:underline touch-scale"
                >
                  <span>Passer au code de jumelage</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 2: SUCCÈS (SESSION OBTENUE) ── */}
        {status === 'success' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>QR CODE SCANNÉ AVEC SUCCÈS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Votre Session ID est généré !
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                La connexion avec WhatsApp est établie. Sauvegardez votre identifiant ci-dessous.
              </p>
            </div>

            {/* Session box */}
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-left relative overflow-hidden">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Clé de Session ID (MENMA-MD)
              </span>
              <div className="font-mono text-xs text-gold break-all bg-black/40 p-3 rounded-xl border border-white/5 select-all">
                {sessionId}
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={copySessionId}
              className={`w-full min-h-[52px] rounded-2xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg touch-scale ${
                copiedSession
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gold hover:bg-gold-light text-dark-950'
              }`}
            >
              {copiedSession ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSession ? 'SESSION ID COPIÉ !' : 'COPIER LA CLÉ DE SESSION'}</span>
            </button>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/env"
                className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center justify-center gap-1.5 touch-scale"
              >
                <span>Générer .ENV</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <button
                onClick={startQrSession}
                className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10 touch-scale"
              >
                Nouveau scan
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: ERREUR ── */}
        {status === 'error' && (
          <div className="py-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 mx-auto flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">Scan QR expiré</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={startQrSession}
              className="w-full min-h-[50px] rounded-2xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all touch-scale"
            >
              <RefreshCw className="w-4 h-4" />
              <span>GÉNÉRER UN NOUVEAU QR CODE</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Reassurance */}
      <div className="qr-animate mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Protocole Baileys Multi-Device certifié • Chiffrement de bout en bout</span>
      </div>
    </div>
  );
}
