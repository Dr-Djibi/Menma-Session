'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  FileCode2,
  ArrowLeft,
  Copy,
  Check,
  Download,
  KeyRound,
  Bot,
  SlidersHorizontal,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Eye,
  ShieldAlert,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface EnvConfig {
  session: string;
  ownerNumber: string;
  ownerName: string;
  botName: string;
  prefix: string;
  timezone: string;
  mode: 'private' | 'public';
  autoReadStatus: 'oui' | 'non';
  autoLikeStatus: 'oui' | 'non';
  antiDelete: 'oui' | 'non';
  chatbot: 'oui' | 'non';
  databaseUrl: string;
}

const DEFAULT_CONFIG: EnvConfig = {
  session: '',
  ownerNumber: '',
  ownerName: 'Dr Djibi',
  botName: '𝙼𝙴𝙽𝙼𝙰-𝙼𝙳',
  prefix: '.',
  timezone: 'Africa/Conakry',
  mode: 'private',
  autoReadStatus: 'non',
  autoLikeStatus: 'oui',
  antiDelete: 'non',
  chatbot: 'non',
  databaseUrl: 'postgresql://postgres:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
};

export default function EnvGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState<boolean>(false);

  useGSAP(
    () => {
      gsap.from('.env-animate', {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  const triggerHaptic = (ms = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (_) {}
    }
  };

  const handleInputChange = (field: keyof EnvConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const generateEnvText = () => {
    return `# ========================================================
# FICHIER DE CONFIGURATION MENMA-MD (.env)
# Généré automatiquement via MENMA Session Web
# ========================================================

# --- [AUTHENTIFICATION WHATSAPP] ---
SESSION_ID=${config.session || 'Menma_md_VOTRE_SESSION_ID'}
NUMERO_PROPRIETAIRE=${config.ownerNumber || '224XXXXXXXXX'}
NOM_PROPRIETAIRE=${config.ownerName}

# --- [IDENTITÉ DU BOT] ---
NOM_BOT=${config.botName}
PREFIXE=${config.prefix}
TIMEZONE=${config.timezone}

# --- [COMPORTEMENT ET STATUTS] ---
MODE=${config.mode}
LECTURE_AUTO_STATUS=${config.autoReadStatus}
AUTO_LIKE_STATUS=${config.autoLikeStatus}

# --- [FONCTIONS AVANCÉES & SÉCURITÉ] ---
ANTI_DELETE=${config.antiDelete}
CHATBOT=${config.chatbot}

# --- [BASE DE DONNÉES POSTGRESQL] ---
DATABASE_URL=${config.databaseUrl}
`;
  };

  const copyEnvToClipboard = () => {
    const text = generateEnvText();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    triggerHaptic(30);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadEnvFile = () => {
    triggerHaptic(20);
    const element = document.createElement('a');
    const file = new Blob([generateEnvText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = '.env';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const stepsMeta = [
    { num: 1, title: 'Authentification', icon: KeyRound },
    { num: 2, title: 'Identité', icon: Bot },
    { num: 3, title: 'Comportement', icon: SlidersHorizontal },
    { num: 4, title: 'IA & Base', icon: Cpu },
  ];

  return (
    <div ref={containerRef} className="px-4 sm:px-6 max-w-4xl mx-auto py-8 pb-32">
      {/* Header Back Link */}
      <div className="env-animate mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-scale"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR À L&apos;ACCUEIL</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="env-animate glass-panel-accent rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl mb-6">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3 shadow-lg">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Générateur de Configuration .ENV
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
            Configurez votre bot Menma-MD étape par étape sans risquer d&apos;erreur de syntaxe.
          </p>
        </div>

        {/* ── STEPPER TABS (OPTIMISÉ MOBILE) ── */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 p-1.5 rounded-2xl bg-black/50 border border-white/10 mb-8">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setCurrentStep(s.num);
                  triggerHaptic(10);
                }}
                className={`py-2 px-1.5 sm:px-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all touch-scale ${
                  isCurrent
                    ? 'bg-gold text-dark-950 font-bold shadow-md'
                    : isCompleted
                    ? 'bg-white/10 text-emerald-400 font-medium'
                    : 'text-neutral-400 hover:text-white bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs tracking-tight truncate">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── FORM STEPS CONTENT ── */}
        <div className="min-h-[280px]">
          {/* STEP 1: AUTHENTICATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gold/10 border border-gold/25 text-xs text-neutral-300 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  L&apos;identifiant de Session et votre numéro sont indispensables pour authentifier le bot sur WhatsApp.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  ID de Session (SESSION_ID) *
                </label>
                <input
                  type="text"
                  placeholder="Menma_md_XXXXXXXX_SESSION_ID"
                  value={config.session}
                  onChange={(e) => handleInputChange('session', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold text-white font-mono text-sm placeholder:text-neutral-600 outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Générez-le depuis l&apos;onglet <strong>Code Pairing</strong> ou <strong>Scan QR</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Numéro du Propriétaire (sans +) *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex : 224625968097"
                    value={config.ownerNumber}
                    onChange={(e) => handleInputChange('ownerNumber', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold text-white font-mono text-sm placeholder:text-neutral-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Nom du Propriétaire
                  </label>
                  <input
                    type="text"
                    value={config.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold text-white text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BOT IDENTITY */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-2.5">
                <Bot className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Personnalisez le nom affiché et le préfixe de commande pour déclencher le bot.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Nom du Bot
                  </label>
                  <input
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleInputChange('botName', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Préfixe de commande
                  </label>
                  <input
                    type="text"
                    value={config.prefix}
                    maxLength={2}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Fuseau Horaire (Timezone)
                </label>
                <input
                  type="text"
                  value={config.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white font-mono text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: BEHAVIOR */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Définissez l&apos;accessibilité publique ou privée et la lecture des statuts WhatsApp.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Mode d&apos;accès
                  </label>
                  <select
                    value={config.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="private">Privé (Propriétaire uniquement)</option>
                    <option value="public">Public (Tout le monde)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Lecture auto status
                  </label>
                  <select
                    value={config.autoReadStatus}
                    onChange={(e) => handleInputChange('autoReadStatus', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Auto-like status
                  </label>
                  <select
                    value={config.autoLikeStatus}
                    onChange={(e) => handleInputChange('autoLikeStatus', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADVANCED AI & DATABASE */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Activez les fonctionnalités avancées : Anti-Delete, Chatbot IA et Base PostgreSQL.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Anti-Delete (Notification message supprimé)
                  </label>
                  <select
                    value={config.antiDelete}
                    onChange={(e) => handleInputChange('antiDelete', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="non">Désactivé</option>
                    <option value="oui">Activé</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Chatbot IA (Réponses automatiques)
                  </label>
                  <select
                    value={config.chatbot}
                    onChange={(e) => handleInputChange('chatbot', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="non">Désactivé</option>
                    <option value="oui">Activé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  URL Base de données PostgreSQL (Supabase / Neon)
                </label>
                <input
                  type="text"
                  value={config.databaseUrl}
                  onChange={(e) => handleInputChange('databaseUrl', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white font-mono text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── STEPPER NAVIGATION BUTTONS ── */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-white/10 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => {
              setCurrentStep((p) => Math.max(1, p - 1));
              triggerHaptic(10);
            }}
            className={`px-4 py-2.5 rounded-xl border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all touch-scale ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-neutral-500'
                : 'text-neutral-300 hover:text-white bg-white/5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Toggle mobile preview drawer */}
            <button
              type="button"
              onClick={() => setShowPreviewMobile(!showPreviewMobile)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 touch-scale"
            >
              <Eye className="w-4 h-4 text-gold" />
              <span className="hidden sm:inline">Aperçu direct</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep((p) => Math.min(4, p + 1));
                  triggerHaptic(10);
                }}
                className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md touch-scale"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={copyEnvToClipboard}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md touch-scale"
              >
                <Check className="w-4 h-4" />
                <span>Terminer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LIVE PREVIEW & EXPORT ACTIONS ── */}
      <div className="env-animate glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Aperçu en direct du fichier .env
            </h3>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
            Format Valide
          </span>
        </div>

        {/* Dynamic code window */}
        <pre className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed max-h-64 scrollbar-none select-all mb-6">
          <code>{generateEnvText()}</code>
        </pre>

        {/* Action Buttons: Copy and Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={copyEnvToClipboard}
            className={`min-h-[50px] rounded-2xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg touch-scale ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-gold hover:bg-gold-light text-dark-950'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'CONFIGURATION COPIÉE !' : 'COPIER LE FICHIER .ENV'}</span>
          </button>

          <button
            onClick={downloadEnvFile}
            className="min-h-[50px] rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition-all touch-scale"
          >
            <Download className="w-4 h-4 text-gold" />
            <span>TÉLÉCHARGER LE .ENV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
