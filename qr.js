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

    sessions.set(id, { status: 'pending', session: null });

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

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
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
                    console.log(`[${id}] Auth successful.`);
                    isFinished = true; // Stop reconnection loop

                    await delay(5000);
                    const credsFile = path.join(tempPath, 'creds.json');
                    if (await fs.pathExists(credsFile)) {
                        const data = await fs.readFile(credsFile, 'utf-8');

                        // Upload to Pastebin for shorter ID
                        let pasteId = "";
                        try {
                            pasteId = await pastebin.createPaste(data, "Menma-MD Session");
                            // Extract ID from URL if necessary
                            if (pasteId.includes("pastebin.com/")) {
                                pasteId = pasteId.split("/").pop();
                            }
                        } catch (pErr) {
                            console.error(`[${id}] Pastebin error:`, pErr.message);
                            // Fallback to Base64 if Pastebin fails (but we want short ID if possible)
                            pasteId = Buffer.from(data).toString('base64');
                        }

                        const b64data = "Menma_md_" + pasteId + "_SESSION_ID";
                        sessions.set(id, { status: 'success', session: b64data });

                        const imgUrl = "https://files.catbox.moe/shye0j.jpg";
                        const msg = `🚀 *𝙼𝙴𝙽𝙼𝙰-𝙼𝙳 𝚂𝙴𝚂𝚂𝙸𝙾𝙽*\n\n` +
                            `✅ *Connexion Réussie*\n` +
                            `👤 *Dev* : Dr Djibi\n\n` +
                            `🔑 *Session ID* :\n` +
                            `\`${b64data}\`\n\n` +
                            `⚠️ *SÉCURITÉ* : Ne partagez *JAMAIS* cette clé ! Elle donne un accès total à votre compte.\n\n` +
                            `📢 *NOS GROUPES & CHAÎNES*\n\n` +
                            `🌐 *Communauté* : https://chat.whatsapp.com/Cl7pAk7RkFG5RADI6Jj0v2\n` +
                            `🛠️ *Support* : https://chat.whatsapp.com/B5d0MwWRJulJyFmwst1Uo6\n` +
                            `🧪 *Groupe Test* : https://chat.whatsapp.com/IOgNUSWKv4g5Ae1UpTkpol\n` +
                            `🎨 *Sticker World* : https://chat.whatsapp.com/INAKFUMpn9BKMvpZZX73K7\n` +
                            `✨ *Deo-World* : https://chat.whatsapp.com/BSg2nx8HZ8V5ZAf53zrhnX\n\n` +
                            `📡 *Chaîne Officielle* : https://whatsapp.com/channel/0029VbCO72yLCoWzRhLAkL2N`;
                        const message = { image: { url: imgUrl }, caption: msg };
                        try {
                            const jid = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                            
                            // Attendre que la session soit prête
                            await delay(5000);

                            // 1. Envoyer d'abord l'ID de session (Priorité)
                            await sock.sendMessage(jid, { text: b64data });
                            console.log(`[${id}] Session envoyée ${b64data}`);
                            await delay(3000);

                            // 2. Envoyer le message d'info (avec sécurité image)
                            try {
                                await sock.sendMessage(jid, { image: { url: imgUrl }, caption: msg });
                            } catch (e) {
                                console.error(`[${id}] Erreur image, envoi texte seul...`);
                                await sock.sendMessage(jid, { text: msg });
                            }
                            await delay(2000);

                            // 3. Auto-join
                            sock.groupAcceptInvite("Cl7pAk7RkFG5RADI6Jj0v2").catch(() => {});
                            sock.groupAcceptInvite("B5d0MwWRJulJyFmwst1Uo6").catch(() => {});
                            sock.groupAcceptInvite("IOgNUSWKv4g5Ae1UpTkpol").catch(() => {});
                            sock.groupAcceptInvite("INAKFUMpn9BKMvpZZX73K7").catch(() => {});
                            sock.groupAcceptInvite("BSg2nx8HZ8V5ZAf53zrhnX").catch(() => {});
                            
                            try {
                                const newsletter = await sock.newsletterMetadata("invite", "0029VbCO72yLCoWzRhLAkL2N");
                                if (newsletter && newsletter.id) {
                                    await sock.newsletterFollow(newsletter.id);
                                }
                            } catch (e) {}
                        } catch (sendErr) {
                            console.error(`[${id}] Impossible d'envoyer le message.`);
                        }
                    }

                    await delay(10000); // 10s de sécurité pour finir les envois
                    if (sock.ws) sock.ws.close();
                    await fs.remove(tempPath).catch(() => { });
                }
            });

        } catch (err) {
            console.error(`[${id}] Error:`, err);
            if (res && !res.headersSent) res.status(500).send("Error");
        }
    };

    connectionHandler();
});

router.get('/status/:id', (req, res) => {
    const state = sessions.get(req.params.id);
    if (!state) return res.status(404).json({ status: 'not_found' });
    res.json(state);
});

module.exports = router;
