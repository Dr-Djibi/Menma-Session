require('dotenv').config();

const express = require('express');
const next    = require('next');
const path    = require('path');
const fs      = require('fs-extra');
const axios   = require('axios');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
    const app = express();

    app.use(express.json());

    // ── Routes API Baileys & Services persistants ─────────────────────────────
    const qrRoute        = require('./qr');
    const pairRoute      = require('./pair');
    const dashboardRoute = require('./dashboard');
    const serveurRoute   = require('./serveur');   // chatbot centralisé

    app.use('/api/qr',        qrRoute);
    app.use('/api/pair',      pairRoute);
    app.use('/api/dashboard', dashboardRoute);
    app.use('/serveur',       serveurRoute);
    // ─────────────────────────────────────────────────────────────────────────

    // ── Next.js App Router : Toutes les pages web React & GSAP ────────────────
    app.all('*', (req, res) => {
        return handle(req, res);
    });
    // ─────────────────────────────────────────────────────────────────────────

    const { startPinger } = require('./pinger');

    app.listen(PORT, () => {
        console.log(`[SERVER] 🚀 Démarré sur le port ${PORT} avec Next.js App Router & GSAP`);
        startPinger();
    });

    // ── Self-ping anti-sleep (Koyeb / Render) ────────────────────────────────
    const SELF_URL = process.env.RENDER_EXTERNAL_URL
        || process.env.APP_URL
        || (process.env.KOYEB_PUBLIC_DOMAIN ? `https://${process.env.KOYEB_PUBLIC_DOMAIN}` : null)
        || `http://localhost:${PORT}`;

    const BOT_URL = process.env.BOT_URL || null;

    setInterval(async () => {
        try {
            await axios.get(SELF_URL + '/', { timeout: 10000 });
            if (BOT_URL) {
                await axios.get(BOT_URL + '/', { timeout: 10000 }).catch(() => {});
            }
            console.log(`[PING] ✅ Services gardés en vie — ${new Date().toLocaleTimeString()}`);
        } catch (e) {
            console.log(`[PING] ⚠️  Health-ping : ${e.message}`);
        }
    }, 4 * 60 * 1000);
    // ─────────────────────────────────────────────────────────────────────────
}).catch((err) => {
    console.error('[NEXT APP INIT ERR] :', err);
    process.exit(1);
});
