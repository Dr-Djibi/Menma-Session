'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  Sticker,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sparkles,
  Info,
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface EnvConfig {
  session: string;
  ownerNumber: string;
  ownerName: string;
  botName: string;
  prefix: string;
  timezone: string;
  mode: 'private' | 'public';
  autoReadStatus: 'non' | 'oui';
  autoLikeStatus: 'oui' | 'non';
  likeEmojis: string;
  stickerPackname: string;
  stickerAuthor: string;
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
  likeEmojis: '💚,❤️,✨,🔥,🙌',
  stickerPackname: 'Menma-MD',
  stickerAuthor: 'Dr-Djibi',
  databaseUrl: '',
};

export default function EnvGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState<boolean>(false);

  // Entrance animations for sections
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.env-animate-card');

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  // Step transition GSAP animation
  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [currentStep]);

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
    const session = config.session.trim() || 'Menma_md_XXXX_SESSION_ID';
    const owner = config.ownerNumber.trim() || '224XXXXXXXXX';
    const ownerName = config.ownerName.trim() || 'Dr Djibi';
    const botName = config.botName.trim() || '𝙼𝙴𝙽𝙼𝙰-𝙼𝙳';
    const prefix = config.prefix.trim() || '.';
    const tz = config.timezone.trim() || 'Africa/Conakry';
    const emojis = config.likeEmojis.trim() || '💚,❤️,✨,🔥,🙌';
    const packname = config.stickerPackname.trim() || 'Menma-MD';
    const author = config.stickerAuthor.trim() || 'Dr-Djibi';
    const dbUrl = config.databaseUrl.trim();

    let text = `# ━━━━━━━\n`;
    text += `# 𝙼𝙴𝙽𝙼𝙰-𝙼𝙳 CONFIGURATION\n`;
    text += `# ━━━━━━━\n\n`;
    text += `SESSION_ID="${session}"\n`;
    text += `NUMERO_OWNER="${owner}"\n`;
    text += `NOM_OWNER="${ownerName}"\n\n`;

    text += `# ─── CONFIG BOT ───\n`;
    text += `NOM_BOT="${botName}"\n`;
    text += `PREFIX="${prefix}"\n`;
    text += `MODE="${config.mode}"\n`;
    text += `ZONE_DE_TEMPS="${tz}"\n\n`;

    text += `# ─── STATUTS & INTERACTIONS ───\n`;
    text += `LECTURE_AUTO_STATUS="${config.autoReadStatus}"\n`;
    text += `AUTO_LIKE_STATUS="${config.autoLikeStatus}"\n`;
    text += `LIKE_STATUS_EMOJIS="${emojis}"\n\n`;

    text += `# ─── STICKERS ───\n`;
    text += `STICKER_PACKNAME="${packname}"\n`;
    text += `STICKER_AUTHOR="${author}"\n`;

    if (dbUrl) {
      text += `\n# ─── DATABASE URL ───\n`;
      text += `DATABASE_URL="${dbUrl}"\n`;
    }

    return text;
  };

  const copyEnvToClipboard = () => {
    const text = generateEnvText();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    triggerHaptic(30);
    showToast('Fichier .env copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadEnvFile = () => {
    triggerHaptic(20);
    const element = document.createElement('a');
    const file = new Blob([generateEnvText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'config.env';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Fichier config.env téléchargé !');
  };

  const stepsMeta = [
    { num: 1, title: 'Authentification', icon: KeyRound },
    { num: 2, title: 'Identité', icon: Bot },
    { num: 3, title: 'Statuts & Likes', icon: SlidersHorizontal },
    { num: 4, title: 'Stickers & DB', icon: Sticker },
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!config.session.trim() || !config.ownerNumber.trim()) {
        showToast("Veuillez renseigner l'ID de Session et le Numéro du Propriétaire", 'error');
        triggerHaptic(40);
        return;
      }
    }
    setCurrentStep((p) => Math.min(4, p + 1));
    triggerHaptic(10);
  };

  return (
    <div ref={containerRef} className="px-4 sm:px-6 max-w-4xl mx-auto py-8 pb-32">
      {/* Header Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-scale"
          aria-label="Retourner à la page d'accueil"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR À L&apos;ACCUEIL</span>
        </Link>
      </div>

      {/* Main Generator Panel */}
      <div className="env-animate-card glass-panel-accent rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl mb-8 border border-white/10">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3 shadow-lg">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Générateur de Fichier .ENV
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
            Configurez facilement les paramètres officiels de votre bot Menma-MD.
          </p>
        </div>

        {/* ── STEPPER TABS ── */}
        <div
          role="tablist"
          aria-label="Étapes de configuration du fichier .env"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-1.5 rounded-2xl bg-black/60 border border-white/10 mb-8"
        >
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Étape ${s.num} : ${s.title}`}
                onClick={() => {
                  setCurrentStep(s.num);
                  triggerHaptic(10);
                }}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all min-h-[44px] touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isCurrent
                    ? 'bg-gold text-dark-950 font-bold shadow-lg'
                    : isCompleted
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-neutral-400 hover:text-white bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs tracking-tight truncate font-semibold">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── FORM STEPS CONTENT ── */}
        <div ref={formRef} className="min-h-[290px] flex flex-col justify-between">
          {/* STEP 1: AUTHENTICATION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gold/10 border border-gold/25 text-xs text-neutral-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Identifiants essentiels pour connecter votre bot Menma-MD à votre compte WhatsApp.
                </span>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="env-session"
                  className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase"
                >
                  ID de Session <span className="text-gold ml-1">*</span>
                </label>
                <input
                  id="env-session"
                  type="text"
                  placeholder="Ex: Menma_md_8fbc7291a..."
                  value={config.session}
                  onChange={(e) => handleInputChange('session', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-sm placeholder:text-neutral-600 outline-none transition-all"
                  aria-required="true"
                  aria-label="ID de Session"
                  required
                />
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Clé générée via l&apos;onglet <strong>Code de Jumelage</strong> ou <strong>Scan QR</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="env-owner-number"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Numéro du Propriétaire <span className="text-gold ml-1">*</span>
                  </label>
                  <input
                    id="env-owner-number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Ex: 224625968097"
                    value={config.ownerNumber}
                    onChange={(e) => handleInputChange('ownerNumber', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-sm placeholder:text-neutral-600 outline-none transition-all"
                    aria-required="true"
                    aria-label="Numéro du Propriétaire"
                    required
                  />
                  <span className="text-[11px] text-neutral-400 font-normal block">
                    Numéro avec indicatif pays sans &apos;+&apos; ni espaces.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="env-owner-name"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Nom du Propriétaire
                  </label>
                  <input
                    id="env-owner-name"
                    type="text"
                    placeholder="Ex: Dr Djibi"
                    value={config.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all"
                    aria-label="Nom du Propriétaire"
                  />
                  <span className="text-[11px] text-neutral-400 font-normal block">
                    Nom affiché dans les commandes d&apos;administration.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BOT IDENTITY */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-3">
                <Bot className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Définissez l&apos;identité, le préfixe de commande et le fuseau horaire de votre bot.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="env-bot-name"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Nom du Bot
                  </label>
                  <input
                    id="env-bot-name"
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleInputChange('botName', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all"
                    aria-label="Nom du Bot"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="env-prefix"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Préfixe
                  </label>
                  <input
                    id="env-prefix"
                    type="text"
                    value={config.prefix}
                    maxLength={2}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-sm outline-none transition-all"
                    aria-label="Préfixe de commande"
                  />
                  <span className="text-[11px] text-neutral-400 font-normal block">
                    Caractère de déclenchement (ex: . ou !).
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="env-timezone"
                  className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                >
                  Zone de Temps
                </label>
                <input
                  id="env-timezone"
                  type="text"
                  value={config.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-sm outline-none transition-all"
                  aria-label="Zone de Temps"
                />
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Format tz database (ex: Africa/Conakry, Europe/Paris).
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: RUNTIME & BEHAVIOR */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-3">
                <SlidersHorizontal className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Configurez le mode de confidentialité et les interactions automatiques avec les statuts.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="env-mode"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Mode
                  </label>
                  <select
                    id="env-mode"
                    value={config.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all cursor-pointer"
                    aria-label="Mode de fonctionnement"
                  >
                    <option value="private">Privé (Private)</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="env-auto-read"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Lecture Auto Status
                  </label>
                  <select
                    id="env-auto-read"
                    value={config.autoReadStatus}
                    onChange={(e) => handleInputChange('autoReadStatus', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all cursor-pointer"
                    aria-label="Lecture Automatique des Statuts"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="env-auto-like"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Auto-Like Status
                  </label>
                  <select
                    id="env-auto-like"
                    value={config.autoLikeStatus}
                    onChange={(e) => handleInputChange('autoLikeStatus', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all cursor-pointer"
                    aria-label="Auto Like des Statuts"
                  >
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="env-like-emojis"
                  className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                >
                  Emojis pour Like
                </label>
                <input
                  id="env-like-emojis"
                  type="text"
                  value={config.likeEmojis}
                  onChange={(e) => handleInputChange('likeEmojis', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all"
                  placeholder="💚,❤️,✨,🔥,🙌"
                  aria-label="Emojis pour Like"
                />
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Liste d&apos;émojis séparés par des virgules pour réagir automatiquement.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: STICKERS & DB */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-3">
                <Sticker className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Personnalisez l&apos;auteur des stickers et spécifiez votre base PostgreSQL si nécessaire.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="env-sticker-pack"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Pack de Stickers
                  </label>
                  <input
                    id="env-sticker-pack"
                    type="text"
                    value={config.stickerPackname}
                    onChange={(e) => handleInputChange('stickerPackname', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all"
                    aria-label="Nom du Pack de Stickers"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="env-sticker-author"
                    className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                  >
                    Auteur des Stickers
                  </label>
                  <input
                    id="env-sticker-author"
                    type="text"
                    value={config.stickerAuthor}
                    onChange={(e) => handleInputChange('stickerAuthor', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white text-sm outline-none transition-all"
                    aria-label="Auteur des Stickers"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="env-db-url"
                  className="text-xs font-semibold text-neutral-300 flex items-center h-5 tracking-wide uppercase truncate"
                >
                  URL Base de Données
                </label>
                <input
                  id="env-db-url"
                  type="text"
                  value={config.databaseUrl}
                  placeholder="postgres://user:password@host:5432/dbname"
                  onChange={(e) => handleInputChange('databaseUrl', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-white font-mono text-xs outline-none transition-all"
                  aria-label="URL de la Base de Données PostgreSQL"
                />
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Optionnel. Utile pour Koyeb, Render, Supabase ou Neon.
                </span>
              </div>
            </div>
          )}

          {/* ── STEPPER NAVIGATION BUTTONS ── */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-white/10 mt-8">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => {
                setCurrentStep((p) => Math.max(1, p - 1));
                triggerHaptic(10);
              }}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold flex items-center gap-2 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed text-neutral-500 border-white/5'
                  : 'text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-neutral-300 flex items-center gap-2 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Afficher ou masquer l'aperçu du fichier env"
              >
                <Eye className="w-4 h-4 text-gold" />
                <span className="hidden sm:inline">Aperçu direct</span>
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-label="Étape suivante"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={copyEnvToClipboard}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Copier la configuration .env terminée"
                >
                  <Check className="w-4 h-4" />
                  <span>Terminer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE PREVIEW & EXPORT ACTIONS ── */}
      <div
        ref={previewRef}
        className={`env-animate-card glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl transition-all ${
          showPreviewMobile ? 'block' : 'hidden sm:block'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Aperçu en direct du fichier .ENV
            </h2>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-semibold">
            Syntaxe Validée
          </span>
        </div>

        {/* Dynamic Code Box */}
        <pre className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed max-h-72 scrollbar-none select-all mb-6 shadow-inner">
          <code>{generateEnvText()}</code>
        </pre>

        {/* Action Buttons: Copy and Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={copyEnvToClipboard}
            className={`min-h-[52px] rounded-2xl font-bold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-gold hover:bg-gold-light text-dark-950'
            }`}
            aria-label="Copier le contenu du fichier .env"
          >
            {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
            <span>{copied ? 'CONFIGURATION COPIÉE !' : 'COPIER LE TEXTE'}</span>
          </button>

          <button
            onClick={downloadEnvFile}
            className="min-h-[52px] rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all touch-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Télécharger le fichier config.env"
          >
            <Download className="w-4.5 h-4.5 text-gold" />
            <span>TÉLÉCHARGER CONFIG.ENV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
