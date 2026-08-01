require('dotenv').config();

const express = require('express');
const path    = require('path');
const fs      = require('fs-extra');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Routes API ────────────────────────────────────────────────────────────────
const qrRoute        = require('./qr');
const pairRoute      = require('./pair');
const dashboardRoute = require('./dashboard');
const serveurRoute   = require('./serveur');   // chatbot centralisé

app.use('/api/qr',        qrRoute);
app.use('/api/pair',      pairRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/serveur',       serveurRoute);       // remplace le bloc inline bugué
// ─────────────────────────────────────────────────────────────────────────────

// ── Routes pages web ─────────────────────────────────────────────────────────
app.get('/pair',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'pair.html')));
app.get('/qr',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'qr.html')));
app.get('/env',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'env.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
// ─────────────────────────────────────────────────────────────────────────────

const { startPinger } = require('./pinger');

app.listen(PORT, () => {
    console.log(`[SERVER] 🚀 Démarré sur le port ${PORT}`);
    startPinger();
});

// ── Self-ping anti-sleep (Koyeb / Render) ────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────
