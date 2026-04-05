const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes pour l'API
const qrRoute = require('./qr');
const pairRoute = require('./pair');

app.use('/api/qr', qrRoute);
app.use('/api/pair', pairRoute);

// Routes pour les pages web
app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pair.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'public', 'qr.html')));
app.get('/env', (req, res) => res.sendFile(path.join(__dirname, 'public', 'env.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const axios = require('axios');

app.listen(PORT, () => console.log(`Server on ${PORT}`));

// --- Auto Health Ping (évite le sleep sur Render/Koyeb) ---
const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || (process.env.KOYEB_PUBLIC_DOMAIN ? `https://${process.env.KOYEB_PUBLIC_DOMAIN}` : null) || `http://localhost:${PORT}`;
const BOT_URL = process.env.BOT_URL || null;

setInterval(async () => {
    try {
        // Ping de soi-même
        await axios.get(SELF_URL + "/", { timeout: 10000 });
        
        // Ping du bot (si configuré) pour le garder éveillé
        if (BOT_URL) {
            await axios.get(BOT_URL + "/", { timeout: 10000 }).catch(() => {});
        }
        
        console.log(`[PING] ✅ Services kept alive at ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        console.log(`[PING] ⚠️ Health-ping report: ${e.message}`);
    }
}, 4 * 60 * 1000); // Toutes les 4 minutes (optimal pour Koyeb/Render)
