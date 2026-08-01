const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// Credentials chatbot (webapi.ai)
const WEBAPI_URL        = 'https://c1878.webapi.ai/cmc/user_message';
const WEBAPI_AUTH_TOKEN = process.env.WEBAPI_AUTH_TOKEN || 'otznwxdd';

const waiters = new Map();

// Le bot IA envoie sa réponse ici
// GET /serveur/incoming?user_id=xxx&text=yyy
router.get('/incoming', (req, res) => {
    const { user_id, text } = req.query;
    if (!user_id || !text) return res.status(400).json({ status: 400, error: 'user_id et text requis' });

    const queue = waiters.get(user_id);
    if (queue && queue.length > 0) {
        const resolve = queue.shift();
        resolve(text);
        if (queue.length === 0) waiters.delete(user_id);
    }

    console.log(`[CHATBOT] Réponse IA pour ${user_id}: ${text.slice(0, 60)}...`);
    res.json({ status: 200 });
});

// Le client web envoie un message et attend la réponse IA (long-polling)
// GET /serveur/chatbot?user_id=xxx&text=yyy
router.get('/chatbot', async (req, res) => {
    const { user_id, text } = req.query;
    if (!user_id || !text) return res.status(400).json({ status: 400, error: 'user_id et text requis' });

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

        // Timeout 15s si le bot ne répond pas
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
        await axios.get(WEBAPI_URL, {
            params: { auth_token: WEBAPI_AUTH_TOKEN, user_id, text }
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
            res.status(500).json({ status: 500, error: err.message });
        }
    }
});

// Santé du chatbot
router.get('/', (_, res) => res.json({ status: 'Chatbot router en ligne' }));

module.exports = router;