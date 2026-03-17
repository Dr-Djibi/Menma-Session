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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const axios = require('axios');

app.listen(PORT, () => console.log(`Server on ${PORT}`));

// --- Auto Health Ping (évite le sleep sur Render/Koyeb) ---
const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || `http://localhost:${PORT}`;
setInterval(async () => {
    try {
        await axios.get(SELF_URL + "/");
        console.log(`[PING] ✅ Alive at ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        console.log(`[PING] ⚠️ Failed: ${e.message}`);
    }
}, 60 * 1000); // toutes les 60 secondes
