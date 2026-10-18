'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  LayoutDashboard,
  ArrowLeft,
  Lock,
  RefreshCw,
  Search,
  Trash2,
  Activity,
  Globe2,
  Server,
  Smartphone,
  Check,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface BotData {
  session_id: string;
  owner_name: string;
  owner_number: string;
  country: string;
  platform: string;
  bot_url?: string;
  is_online: boolean;
  uptime_sec?: number;
  last_active: string;
}

interface StatsData {
  total: number;
  totalOnline: number;
  countries: { country: string; count: number }[];
  platforms: { platform: string; count: number }[];
  bots: BotData[];
}

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnline, setFilterOnline] = useState<'all' | 'online' | 'offline'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.from('.dash-animate', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setAuthError('');
    triggerHaptic(15);

    try {
      const res = await fetch('/api/dashboard/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Mot de passe incorrect.');
      }

      setStats(data);
      setIsAuthenticated(true);
      triggerHaptic([30, 50]);
    } catch (err: any) {
      setAuthError(err.message || 'Authentification échouée.');
      triggerHaptic(50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshStats = async () => {
    if (!password) return;
    setIsLoadingStats(true);
    triggerHaptic(15);

    try {
      const res = await fetch('/api/dashboard/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error('[Refresh Stats Error]:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeleteBot = async (sessionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bot de la base de données ?')) {
      return;
    }

    setDeletingId(sessionId);
    triggerHaptic(20);

    try {
      const res = await fetch('/api/dashboard/delete-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, session_id: sessionId }),
      });

      if (res.ok) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                bots: prev.bots.filter((b) => b.session_id !== sessionId),
                total: prev.total - 1,
              }
            : null
        );
        triggerHaptic([20, 40]);
      } else {
        alert('Impossible de supprimer ce bot.');
      }
    } catch (err) {
      console.error('[Delete Bot Error]:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}j ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const filteredBots = (stats?.bots || []).filter((b) => {
    const matchQuery =
      b.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner_number?.includes(searchQuery) ||
      b.session_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.country?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;
    if (filterOnline === 'online') return b.is_online === true;
    if (filterOnline === 'offline') return !b.is_online;
    return true;
  });

  return (
    <div ref={containerRef} className="px-4 sm:px-6 max-w-5xl mx-auto py-8 pb-32">
      {/* Header Back Button */}
      <div className="dash-animate mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-scale"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETOUR À L&apos;ACCUEIL</span>
        </Link>
      </div>

      {/* ── UN-AUTHENTICATED: PASSWORD MODAL ── */}
      {!isAuthenticated ? (
        <div className="dash-animate max-w-md mx-auto glass-panel-accent rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-4 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            Dashboard Télémétrie
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            Accès sécurisé réservé aux administrateurs MENMA-MD.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe administrateur"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-13 px-4 pr-11 rounded-2xl bg-black/50 border border-white/15 focus:border-gold text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] rounded-2xl bg-gold hover:bg-gold-light active:scale-95 text-dark-950 font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all touch-scale"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span>DÉVERROUILLER LE DASHBOARD</span>
            </button>
          </form>
        </div>
      ) : (
        /* ── AUTHENTICATED: DASHBOARD CONTENT ── */
        <div className="space-y-6">
          {/* Top Info Bar */}
          <div className="dash-animate glass-panel rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-gold" />
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Télémétrie Active MENMA-MD
                </h1>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Surveillance de l&apos;infrastructure et état des bots déployés.
              </p>
            </div>

            <button
              onClick={refreshStats}
              disabled={isLoadingStats}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-neutral-300 flex items-center gap-2 transition-all touch-scale"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          {/* ── METRIC STAT CARDS ── */}
          <div className="dash-animate grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Bots */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                Total Bots
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {stats?.total ?? 0}
              </span>
            </div>

            {/* En Ligne */}
            <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-emerald-400">
                  En Ligne
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {stats?.totalOnline ?? 0}
              </span>
            </div>

            {/* Taux Uptime */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                Santé Réseau
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gold font-mono">
                {stats?.total && stats.total > 0
                  ? `${Math.round((stats.totalOnline / stats.total) * 100)}%`
                  : '100%'}
              </span>
            </div>

            {/* Pays Connectés */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                Pays Détectés
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {stats?.countries?.length ?? 0}
              </span>
            </div>
          </div>

          {/* ── SEARCH & FILTER CONTROLS ── */}
          <div className="dash-animate glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, numéro, pays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-gold"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['all', 'online', 'offline'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterOnline(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all touch-scale ${
                    filterOnline === filter
                      ? 'bg-gold text-dark-950 font-bold'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'Tous' : filter === 'online' ? 'En ligne' : 'Hors ligne'}
                </button>
              ))}
            </div>
          </div>

          {/* ── BOT CARDS (RESPONSIVE TOUCH LIST) ── */}
          <div className="dash-animate space-y-3">
            {filteredBots.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center border border-white/10">
                <Smartphone className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">Aucun bot ne correspond à votre filtre.</p>
              </div>
            ) : (
              filteredBots.map((bot) => (
                <div
                  key={bot.session_id}
                  className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-gold/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          bot.is_online ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-neutral-600'
                        }`}
                      />
                      <h4 className="text-sm font-bold text-white">
                        {bot.owner_name || 'Inconnu'}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        +{bot.owner_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{bot.country || 'N/A'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{bot.platform || 'Koyeb/Render'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Uptime: {formatUptime(bot.uptime_sec)}</span>
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-neutral-500 truncate max-w-xs sm:max-w-md">
                      ID: {bot.session_id}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button
                      onClick={() => handleDeleteBot(bot.session_id)}
                      disabled={deletingId === bot.session_id}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors touch-scale"
                    >
                      {deletingId === bot.session_id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
