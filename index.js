const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Chatbot (anciennement serveur.js) ─────────────────────────────────────────
const waiters = new Map();

// Le bot envoie la réponse IA ici
app.get('/serveur/incoming', (req, res) => {
  const { user_id, text } = req.query;
  if (!user_id || !text) return res.json({ status: 400 });

  const queue = waiters.get(user_id);
  if (queue && queue.length > 0) {
    const resolve = queue.shift();
    resolve(text);
    if (queue.length === 0) waiters.delete(user_id);
  }

  console.log(`[CHATBOT] Réponse IA pour ${user_id}: ${text.slice(0, 50)}...`);
  res.json({ status: 200 });
});

// Le client web envoie son message et attend la réponse IA
app.get('/serveur/chatbot', async (req, res) => {
  const { user_id, text } = req.query;
  if (!user_id || !text) return res.json({ status: 400 });

  let queue = waiters.get(user_id);
  if (!queue) {
    queue = [];
    waiters.set(user_id, queue);
  }

  let resolveFunc;
  let resSent = false;

  const responsePromise = new Promise(resolve => {
    resolveFunc = resolve;
    queue.push(resolve);

    setTimeout(() => {
      const idx = queue.indexOf(resolveFunc);
      if (idx !== -1) queue.splice(idx, 1);
      if (queue.length === 0) waiters.delete(user_id);
      if (!resSent) {
        resSent = true;
        res.json({ text: null, timeout: true });
      }
    }, 15000);
  });

  try {
    await axios.get('https://c1932.webapi.ai/cmc/user_message', {
      params: { auth_token: 'i0n3d6ss', user_id, text }
    });

    const reply = await responsePromise;
    if (!resSent) {
      resSent = true;
      res.json({ text: reply });
    }
  } catch (err) {
    const idx = queue.indexOf(resolveFunc);
    if (idx !== -1) queue.splice(idx, 1);
    if (queue.length === 0) waiters.delete(user_id);
    if (!resSent) {
      resSent = true;
      res.json({ status: 500 });
    }
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Routes pour l'API
const qrRoute = require('./qr');
const pairRoute = require('./pair');
const dashboardRoute = require('./dashboard');

app.use('/api/qr', qrRoute);
app.use('/api/pair', pairRoute);
app.use('/api/dashboard', dashboardRoute);

// Routes pour les pages web
app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pair.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'public', 'qr.html')));
app.get('/env', (req, res) => res.sendFile(path.join(__dirname, 'public', 'env.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const axios = require('axios');
const { startPinger } = require('./pinger');

app.listen(PORT, () => {
    console.log(`Server on ${PORT}`);
    startPinger(); // Démarre le ping centralisé des bots
});

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
