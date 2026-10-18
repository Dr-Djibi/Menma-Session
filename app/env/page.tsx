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
  Sticker,
  ChevronRight,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

gsap.registerPlugin(useGSAP);

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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState<boolean>(false);

  useGSAP(
    () => {
      gsap.from('.env-animate', {
        opacity: 0,
        y: 20,
        duration: 0.6,
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
            Générateur de Fichier .ENV
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
            Générez la configuration officielle de votre bot Menma-MD.
          </p>
        </div>

        {/* ── STEPPER TABS (MOBILE & DESKTOP) ── */}
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
                  Ces informations d&apos;authentification sont obligatoires pour que le bot puisse se connecter à votre compte WhatsApp.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  ID de Session (SESSION_ID) *
                </label>
                <input
                  type="text"
                  placeholder="Menma_md_XXXX_SESSION_ID..."
                  value={config.session}
                  onChange={(e) => handleInputChange('session', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold text-white font-mono text-sm placeholder:text-neutral-600 outline-none"
                  required
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Généré depuis l&apos;onglet <strong>Code de Jumelage</strong> ou <strong>Scan QR</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Num. Propriétaire (Sans +) (NUMERO_OWNER) *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 224XXXXXXXXX"
                    value={config.ownerNumber}
                    onChange={(e) => handleInputChange('ownerNumber', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold focus:ring-1 focus:ring-gold text-white font-mono text-sm placeholder:text-neutral-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Nom du Propriétaire (NOM_OWNER)
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
                  Définissez la personnalité et les réglages de base pour l&apos;interface de votre bot.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Nom du Bot (NOM_BOT)
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
                    Préfixe (PREFIX)
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
                  Zone de Temps (ZONE_DE_TEMPS)
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

          {/* STEP 3: RUNTIME & BEHAVIOR */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Configurez les interactions automatiques et le mode d&apos;accès (public ou restreint).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Mode de fonctionnement (MODE)
                  </label>
                  <select
                    value={config.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value as any)}
                    className="w-full h-12 px-3 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  >
                    <option value="private">Private (Privé)</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Lecture Auto Status (LECTURE_AUTO_STATUS)
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
                    Auto-Like Status (AUTO_LIKE_STATUS)
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

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Emojis pour &apos;Like&apos; (LIKE_STATUS_EMOJIS) (séparés par virgule)
                </label>
                <input
                  type="text"
                  value={config.likeEmojis}
                  onChange={(e) => handleInputChange('likeEmojis', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  placeholder="💚,❤️,✨,🔥,🙌"
                />
              </div>
            </div>
          )}

          {/* STEP 4: STICKERS & DB */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-start gap-2.5">
                <Sticker className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Ajustez les métadonnées des stickers générés et l&apos;accès à la base de données PostgreSQL si vous hébergez sur Koyeb ou Render.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Pack de Stickers (STICKER_PACKNAME)
                  </label>
                  <input
                    type="text"
                    value={config.stickerPackname}
                    onChange={(e) => handleInputChange('stickerPackname', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Auteur des Stickers (STICKER_AUTHOR)
                  </label>
                  <input
                    type="text"
                    value={config.stickerAuthor}
                    onChange={(e) => handleInputChange('stickerAuthor', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  URL Base de Données (DATABASE_URL) <span className="text-neutral-500 font-normal">(Optionnel | Koyeb / Render PostgreSQL)</span>
                </label>
                <input
                  type="text"
                  value={config.databaseUrl}
                  placeholder="postgres://user:pass@host/db"
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
                onClick={handleNextStep}
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
              Aperçu en direct du .env
            </h3>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
            Format Menma-MD
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
            <span>{copied ? 'CONFIGURATION COPIÉE !' : 'COPIER LE TEXTE'}</span>
          </button>

          <button
            onClick={downloadEnvFile}
            className="min-h-[50px] rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition-all touch-scale"
          >
            <Download className="w-4 h-4 text-gold" />
            <span>TÉLÉCHARGER config.env</span>
          </button>
        </div>
      </div>
    </div>
  );
}
