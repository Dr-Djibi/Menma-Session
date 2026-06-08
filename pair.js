const express = require('express');
const router = express.Router();
const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');
const Baileys = require("@whiskeysockets/baileys");
const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    delay,
    jidNormalizedUser,
    DisconnectReason
} = Baileys;
const makeWASocket = Baileys.default || Baileys.makeWASocket || Baileys;
const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');

function makeid(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const sessions = new Map();

// Endpoint pour obtenir le code de jumelage
const axios = require('axios');

router.get('/', async (req, res) => {
    const id = makeid(10);
    const num = req.query.number;
    const userId = req.query.userId;
    if (!num) return res.status(400).send("No number");

    const cleanNum = num.replace(/[^0-9]/g, '');
    console.log(`[Pair-${id}] Starting for ${cleanNum} (userId: ${userId || 'none'})`);

    const tempPath = path.join(__dirname, 'temp', id);
    let sock;
    let isFinished = false;
    let codeSent = false;

    sessions.set(id, { status: 'pending', session: null, code: null });

    const startSocket = async () => {
        if (isFinished) return;

        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(tempPath);

            sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.ubuntu("Chrome"),
                markOnlineOnConnect: false,
                syncFullHistory: false,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
            });

            sock.ev.on('creds.update', saveCreds);

            // Demander le code de jumelage si pas encore enregistré
            if (!sock.authState.creds.registered) {
                await delay(3000);
                try {
                    console.log(`[Pair-${id}] Requesting code for: ${cleanNum}`);
                    const code = await sock.requestPairingCode(cleanNum);
                    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                    console.log(`[Pair-${id}] Code generated successfully: ${formattedCode}`);
                    sessions.set(id, { status: 'pending', session: null, code: formattedCode });
                    codeSent = true;
                    if (res && !res.headersSent) {
                        res.json({ code: formattedCode, id });
                    }
                } catch (codeErr) {
                    console.error(`[Pair-${id}] Critical error in requestPairingCode:`, codeErr);
                    sessions.set(id, { status: 'error', session: null });
                    if (res && !res.headersSent) res.status(500).json({ error: 'Impossible de générer le code. Vérifiez le numéro ou réessayez.' });
                    await fs.remove(tempPath).catch(() => { });
                    return;
                }
            }

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log(`[${id}] connection.update → ${connection || 'n/a'}, statusCode: ${statusCode || 'n/a'}`);

                if (connection === 'close') {
                    if (isFinished) return;

                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        console.log(`[${id}] Déconnecté (LoggedOut). Abandon.`);
                        sessions.set(id, { status: 'error', session: null });
                        await fs.remove(tempPath).catch(() => { });
                        return;
                    }

                    if (statusCode === 405) {
                        console.log(`[${id}] Déjà couplé ailleurs. Abandon.`);
                        sessions.set(id, { status: 'error', session: null });
                        await fs.remove(tempPath).catch(() => { });
                        return;
                    }

                    if (codeSent) {
                        console.log(`[${id}] Reconnexion pour maintenir la session de couplage...`);
                        setTimeout(startSocket, 3000);
                    } else {
                        console.log(`[${id}] Réessai (code pas encore envoyé)...`);
                        setTimeout(startSocket, 3000);
                    }
                }

                if (connection === 'open') {
                    console.log(`[${id}] ✅ Couplage réussi ! Vérification des crédentials...`);

                    let retries = 0;
                    while (retries < 10 && (!sock.authState.creds.me || !sock.authState.creds.registered)) {
                        await delay(1000);
                        retries++;
                    }

                    if (!sock.authState.creds.me || !sock.authState.creds.registered) {
                        console.error(`[${id}] ❌ Échec : Creds incomplets.`);
                        sessions.set(id, { status: 'error', session: null });
                        return;
                    }

                    isFinished = true;
                    const credsFile = path.join(tempPath, 'creds.json');
                    const credsData = await fs.readJson(credsFile);

                    // Si on a un userId, on push directement les creds à l'API SaaS
                    if (userId) {
                        const saasApiUrl = process.env.SAAS_API_URL || 'http://localhost:3000';
                        const saasWebhookSecret = process.env.SAAS_WEBHOOK_SECRET || 'secret-partage-session';

                        try {
                            console.log(`[${id}] Push direct de la session au SaaS pour l'utilisateur: ${userId}...`);
                            const response = await axios.post(`${saasApiUrl}/api/bots/session-callback`, {
                                userId: userId,
                                creds: credsData
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${saasWebhookSecret}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 15000
                            });

                            if (response.status === 200) {
                                console.log(`[${id}] ✅ SaaS a bien enregistré les credentials et lancé le bot.`);
                                sessions.set(id, { status: 'success', session: `SaaS-Linked-${userId}` });
                            } else {
                                console.error(`[${id}] ❌ Réponse inattendue du SaaS :`, response.status, response.data);
                                sessions.set(id, { status: 'error', session: null });
                            }
                        } catch (pushErr) {
                            console.error(`[${id}] ❌ Échec du push vers le SaaS :`, pushErr.message);
                            sessions.set(id, { status: 'error', session: null });
                        }
                    } else {
                        // Comportement classique hors SaaS : Envoi via Pastebin et message WhatsApp
                        const dataStr = JSON.stringify(credsData, null, 2);
                        let pasteId = '';
                        try {
                            const result = await pastebin.createPaste(dataStr, 'Menma-MD Session');
                            pasteId = result.includes('pastebin.com/') ? result.split('/').pop() : result;
                        } catch (pErr) {
                            console.error(`[${id}] Pastebin error:`, pErr.message);
                            pasteId = Buffer.from(dataStr).toString('base64');
                        }

                        const sessionId = 'Menma_md_' + pasteId + '_SESSION_ID';
                        sessions.set(id, { status: 'success', session: sessionId });

                        const imgUrl = 'https://files.catbox.moe/shye0j.jpg';
                        const msg = `🚀 *𝙼𝙴𝙽𝙼𝙰-𝙼𝙳 𝚂𝙴𝚂𝚂𝙸𝙾𝙽*\n\n✅ *Connexion Réussie*\n\n🔑 *Session ID* :\n\`${sessionId}\`\n\n⚠️ *SÉCURITÉ* : Ne partagez *JAMAIS* cette clé !`;

                        try {
                            const jid = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                            await delay(5000);
                            await sock.sendMessage(jid, { text: sessionId });
                            await delay(3000);
                            await sock.sendMessage(jid, { image: { url: imgUrl }, caption: msg });

                            // Auto-join
                            sock.groupAcceptInvite("Cl7pAk7RkFG5RADI6Jj0v2").catch(() => { });
                            sock.groupAcceptInvite("B5d0MwWRJulJyFmwst1Uo6").catch(() => { });
                            sock.groupAcceptInvite("IOgNUSWKv4g5Ae1UpTkpol").catch(() => { });
                            sock.groupAcceptInvite("INAKFUMpn9BKMvpZZX73K7").catch(() => { });
                            sock.groupAcceptInvite("BSg2nx8HZ8V5ZAf53zrhnX").catch(() => { });
                        } catch (sendErr) {
                            console.error(`[${id}] Impossible d'envoyer le message de session :`, sendErr.message);
                        }
                    }

                    await delay(10000);
                    try { sock.ws.close(); } catch (_) { }
                    await fs.remove(tempPath).catch(() => { });
                }
            });

        } catch (err) {
            console.error(`[${id}] Erreur socket:`, err.message);
            sessions.set(id, { status: 'error', session: null });
            if (!res.headersSent) res.status(500).json({ error: 'Erreur interne' });
            await fs.remove(tempPath).catch(() => { });
        }
    };

    startSocket();
});

router.get('/status/:id', (req, res) => {
    const state = sessions.get(req.params.id);
    if (!state) return res.status(404).json({ status: 'not_found' });
    res.json(state);
});

module.exports = router;
