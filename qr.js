const express = require('express');
const router = express.Router();
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs-extra');
const Baileys = require("@whiskeysockets/baileys");
const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    delay,
    jidNormalizedUser
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

router.get('/', async (req, res) => {
    const id = req.query.id || makeid();
    console.log(`[QR-${id}] Starting...`);
    const tempPath = path.join(__dirname, 'temp', id);
    let sock;
    let qrSent = false;
    let isFinished = false;

    sessions.set(id, { status: 'pending', session: null, sock: null, lastActive: Date.now() });

    const connectionHandler = async () => {
        if (isFinished) return;
        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(tempPath);

            sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Baileys.Browsers.ubuntu("Chrome"),
                markOnlineOnConnect: false,
                syncFullHistory: false,
            });

            // Associer l'instance de la socket à la session
            const sData = sessions.get(id);
            if (sData) sData.sock = sock;

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                try {
                    const { connection, lastDisconnect, qr } = update;
                    console.log(`[${id}] Update: ${connection || 'pending'}, QR: ${!!qr}`);

                    if (qr && !qrSent) {
                        qrSent = true;
                        if (res && !res.headersSent) {
                            res.setHeader('Content-Type', 'image/png');
                            res.send(await QRCode.toBuffer(qr));
                        }
                    }

                    if (connection === 'close') {
                        const reason = lastDisconnect?.error?.output?.statusCode;
                        console.error(`[${id}] Closed. Reason: ${reason}`);

                        if (isFinished) return;

                        if (reason !== 401) {
                            console.log(`[${id}] Reconnecting...`);
                            setTimeout(connectionHandler, 2000);
                        } else {
                            sessions.set(id, { status: 'error', session: null });
                            await fs.remove(tempPath).catch(() => { });
                        }
                    }

                    if (connection === 'open') {
                        console.log(`[${id}] ✅ Couplage réussi ! Vérification des crédentials...`);

                        let retries = 0;
                        while (retries < 10 && !sock.authState.creds.me) {
                            await delay(1000);
                            retries++;
                        }

                        if (!sock.authState.creds.me) {
                            console.error(`[${id}] ❌ Échec : Creds incomplets (me introuvable).`);
                            sessions.set(id, { status: 'error', session: null });
                            if (sock.ws) {
                                try { sock.ws.close(); } catch (_) {}
                            }
                            await fs.remove(tempPath).catch(() => { });
                            return;
                        }

                        isFinished = true;
                        const credsFile = path.join(tempPath, 'creds.json');

                        // Lecture robuste avec retries pour parer aux lenteurs d'écriture disque
                        let data = null;
                        for (let i = 0; i < 15; i++) {
                            try {
                                if (await fs.pathExists(credsFile)) {
                                    const rawData = await fs.readFile(credsFile, 'utf-8');
                                    if (rawData.trim().length > 0) {
                                        const parsed = JSON.parse(rawData);
                                        if (parsed && parsed.me) {
                                            data = rawData;
                                            break;
                                        }
                                    }
                                }
                            } catch (readErr) {
                                console.log(`[${id}] Attente de creds.json complet (${i+1}/15) : ${readErr.message}`);
                            }
                            await delay(1000);
                        }

                        if (!data) {
                            throw new Error("Credentials invalides ou absents du fichier creds.json.");
                        }

                        // Upload to Pastebin
                        let pasteId = "";
                        try {
                            pasteId = await pastebin.createPaste(data, "Menma-MD Session");
                            if (pasteId.includes("pastebin.com/")) {
                                pasteId = pasteId.split("/").pop();
                            }
                        } catch (pErr) {
                            console.error(`[${id}] Pastebin error:`, pErr.message);
                            pasteId = Buffer.from(data).toString('base64');
                        }

                        const b64data = "Menma_md_" + pasteId + "_SESSION_ID";
                        sessions.set(id, { status: 'success', session: b64data });

                        const imgUrl = "https://files.catbox.moe/oh71s4.jpg";
                        const msg = `🚀 *𝙼𝙴𝙽𝙼𝙰-𝙼𝙳 𝚂𝙴𝚂𝚂𝙸𝙾𝙽*\n\n✅ *Connexion Réussie*\n\n🔑 *Session ID* :\n\`${b64data}\`\n\n⚠️ *SÉCURITÉ* : Ne partagez *JAMAIS* cette clé !`;

                        try {
                            const jid = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                            await delay(5000);
                            await sock.sendMessage(jid, { text: b64data });
                            await delay(3000);
                            await sock.sendMessage(jid, { image: { url: imgUrl }, caption: msg });

                            // Auto-join
                            sock.groupAcceptInvite("Cl7pAk7RkFG5RADI6Jj0v2").catch(() => { });
                            sock.groupAcceptInvite("B5d0MwWRJulJyFmwst1Uo6").catch(() => { });
                            sock.groupAcceptInvite("IOgNUSWKv4g5Ae1UpTkpol").catch(() => { });
                            sock.groupAcceptInvite("INAKFUMpn9BKMvpZZX73K7").catch(() => { });
                            sock.groupAcceptInvite("BSg2nx8HZ8V5ZAf53zrhnX").catch(() => { });
                        } catch (sendErr) {
                            console.error(`[${id}] Impossible d'envoyer le message.`);
                        }

                        await delay(10000);
                        if (sock.ws) {
                            try { sock.ws.close(); } catch (_) {}
                        }
                        await fs.remove(tempPath).catch(() => { });
                    }
                } catch (connectionErr) {
                    console.error(`[${id}] Erreur critique dans connection.update :`, connectionErr);
                    sessions.set(id, { status: 'error', session: null });
                    if (sock && sock.ws) {
                        try { sock.ws.close(); } catch (_) {}
                    }
                    await fs.remove(tempPath).catch(() => { });
                }
            });

        } catch (err) {
            console.error(`[${id}] Error:`, err);
            if (sock && sock.ws) {
                try { sock.ws.close(); } catch (_) {}
            }
            if (res && !res.headersSent) res.status(500).send("Error");
        }
    };

    connectionHandler();
});

router.get('/status/:id', (req, res) => {
    const state = sessions.get(req.params.id);
    if (!state) return res.status(404).json({ status: 'not_found' });

    // Mettre à jour le dernier poll
    state.lastActive = Date.now();

    res.json({
        status: state.status,
        session: state.session
    });
});

// Garbage collector pour nettoyer les sockets inactifs
setInterval(async () => {
    const now = Date.now();
    for (const [id, state] of sessions.entries()) {
        // Si la session est en attente (pending) et n'a pas été interrogée depuis plus de 25 secondes
        if (state.status === 'pending' && state.lastActive && (now - state.lastActive > 25000)) {
            console.log(`[GC-QR] Nettoyage de la session inactive : ${id}`);
            sessions.delete(id);
            if (state.sock) {
                try {
                    state.sock.ev.removeAllListeners();
                    if (state.sock.ws) state.sock.ws.close();
                } catch (e) { }
            }
            const tempPath = path.join(__dirname, 'temp', id);
            await fs.remove(tempPath).catch(() => { });
        }

        // Nettoyage des sessions terminées/en erreur de la mémoire après 5 minutes
        if (state.status !== 'pending' && state.lastActive && (now - state.lastActive > 5 * 60 * 1000)) {
            console.log(`[GC-QR] Nettoyage session terminée/échouée : ${id}`);
            sessions.delete(id);
            if (state.sock) {
                try {
                    state.sock.ev.removeAllListeners();
                    if (state.sock.ws) state.sock.ws.close();
                } catch (e) { }
            }
            const tempPath = path.join(__dirname, 'temp', id);
            await fs.remove(tempPath).catch(() => { });
        }
    }
}, 10000);

module.exports = router;
