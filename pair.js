const express = require('express');
const router = express.Router();
const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    delay,
    jidNormalizedUser,
    DisconnectReason
} = require("@whiskeysockets/baileys");
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
router.get('/', async (req, res) => {
    const id = makeid(10);
    const num = req.query.number;
    if (!num) return res.status(400).send("No number");

    const cleanNum = num.replace(/[^0-9]/g, '');
    console.log(`[Pair-${id}] Starting for ${cleanNum}`);

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
                browser: Browsers.macOS("Desktop"),
                markOnlineOnConnect: false,
                syncFullHistory: false,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
            });

            sock.ev.on('creds.update', saveCreds);

            // Demander le code de jumelage si pas encore enregistré
            if (!sock.authState.creds.registered) {
                await delay(3000); // Délai accru pour la stabilité initiale
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

                    // 401 = logged out / mauvais credentials → ne pas réessayer
                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        console.log(`[${id}] Déconnecté (LoggedOut). Abandon.`);
                        sessions.set(id, { status: 'error', session: null });
                        await fs.remove(tempPath).catch(() => { });
                        return;
                    }

                    // 405 = already paired elsewhere — laisser tomber aussi
                    if (statusCode === 405) {
                        console.log(`[${id}] Déjà couplé ailleurs. Abandon.`);
                        sessions.set(id, { status: 'error', session: null });
                        await fs.remove(tempPath).catch(() => { });
                        return;
                    }

                    // Si le code a déjà été envoyé, on garde le socket vivant en reconnectant
                    // car l'utilisateur est en train d'entrer le code sur WhatsApp
                    if (codeSent) {
                        console.log(`[${id}] Reconnexion pour maintenir la session de couplage...`);
                        setTimeout(startSocket, 3000);
                    } else {
                        // Code pas encore envoyé, réessayer aussi
                        console.log(`[${id}] Réessai (code pas encore envoyé)...`);
                        setTimeout(startSocket, 3000);
                    }
                }

                if (connection === 'open') {
                    console.log(`[${id}] ✅ Couplage réussi !`);
                    isFinished = true;

                    // Attendre que les creds soient bien sauvegardés
                    await delay(4000);

                    const credsFile = path.join(tempPath, 'creds.json');
                    if (await fs.pathExists(credsFile)) {
                        const data = await fs.readFile(credsFile, 'utf-8');

                        let pasteId = '';
                        try {
                            const result = await pastebin.createPaste(data, 'Menma-MD Session');
                            pasteId = result.includes('pastebin.com/') ? result.split('/').pop() : result;
                        } catch (pErr) {
                            console.error(`[${id}] Pastebin error:`, pErr.message);
                            // Fallback: base64
                            pasteId = Buffer.from(data).toString('base64');
                        }

                        const sessionId = 'Menma_md_' + pasteId + '_SESSION_ID';
                        sessions.set(id, { status: 'success', session: sessionId });

                        const imgUrl = 'https://files.catbox.moe/h0va1p.jpg';
                        const msg =
                            `*✨ 𝗠𝗘𝗡𝗠𝗔-𝗠𝗗 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗘 ✨*\n\n` +
                            `> *🌟 État* : \`Connecté avec Succès (Pairing Code)\`\n` +
                            `> *🔑 ID* : \`${sessionId}\`\n\n` +
                            `_Désormais, copiez cet ID et collez-le dans vos variables d'environnement (SESSION_ID)._\n\n` +
                            `*🔗 Liens Utiles :*\n` +
                            `⋄ *Repo* : https://github.com/Dr-Djibi/Menma-MD\n` +
                            `⋄ *Dev* : Dr Djibi\n\n` +
                            `*© _2026 Dr Djibi - Menma-MD_*`;

                        try {
                            const jid = jidNormalizedUser(sock.user.id);
                            await sock.sendMessage(jid, { image: { url: imgUrl }, caption: msg });
                            await delay(1000);
                            await sock.sendMessage(jid, { text: sessionId });
                            console.log(`[${id}] ✅ Session envoyée: ${sessionId}`);
                        } catch (sendErr) {
                            console.error(`[${id}] Impossible d'envoyer le message:`, sendErr.message);
                        }
                    } else {
                        console.error(`[${id}] creds.json introuvable.`);
                        sessions.set(id, { status: 'error', session: null });
                    }

                    await delay(2000);
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

// Endpoint pour vérifier le statut de la session (utilisé par le frontend)
router.get('/status/:id', (req, res) => {
    const state = sessions.get(req.params.id);
    if (!state) return res.status(404).json({ status: 'not_found' });
    res.json(state);
});

module.exports = router;
