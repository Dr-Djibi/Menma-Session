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
    jidNormalizedUser
} = require("ovl_wa_baileys");
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
    console.log(`[Pair-${id}] Starting for ${num}`);

    const tempPath = path.join(__dirname, 'temp', id);
    let sock;
    let isFinished = false;

    sessions.set(id, { status: 'pending', session: null, code: null });

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
                browser: Browsers.macOS("Menma-Md"),
                markOnlineOnConnect: false,
                syncFullHistory: false,
            });

            sock.ev.on('creds.update', saveCreds);

            if (!sock.authState.creds.registered) {
                await delay(1500);
                const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
                sessions.set(id, { status: 'pending', session: null, code: code });
                if (res && !res.headersSent) res.json({ code, id });
            }

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                console.log(`[${id}] Update: ${connection || 'pending'}`);

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
                            if (pasteId.includes("pastebin.com/")) {
                                pasteId = pasteId.split("/").pop();
                            }
                        } catch (pErr) {
                            console.error(`[${id}] Pastebin error:`, pErr.message);
                            pasteId = Buffer.from(data).toString('base64');
                        }

                        const b64data = "Menma_md_" + pasteId + "_SESSION_ID";

                        sessions.set(id, { status: 'success', session: b64data });
                        const rl = "https://files.catbox.moe/h0va1p.jpg";
                        const msg = `*🤖 𝗠𝗘𝗡𝗠𝗔-𝗠𝗗 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗘 🤖*\n\n` +
                            `> *ID* : \`${b64data}\`\n\n` +
                            `_Voici votre ID de session, gardez-le en sécurité._\n\n` +
                            `Lien du repo : https://github.com/DrDjibi/Menma-Md \n` +
                            `Developpeur : Dr Djibi\n\n\n` +
                            `*© _2026 Dr Djibi_*`;
                        const message = { image: { url: rl }, caption: msg };
                        try {
                            await sock.sendMessage(jidNormalizedUser(sock.user.id), message);
                            await sock.sendMessage(jidNormalizedUser(sock.user.id), { text: b64data });
                            console.log(`[${id}] Session envoyée ${b64data}`);
                        } catch (sendErr) {
                            console.error(`[${id}] Impossible d'envoyer le message.`);
                        }
                    }

                    await delay(2000);
                    if (sock.ws) sock.ws.close();
                    await fs.remove(tempPath).catch(() => { });
                }
            });

        } catch (err) {
            console.error(`[${id}] Error:`, err);
            sessions.set(id, { status: 'error', session: null });
            if (res && !res.headersSent) res.status(500).send("Error");
        }
    };

    connectionHandler();
});

// Endpoint pour vérifier le statut de la session (utilisé par le frontend)
router.get('/status/:id', (req, res) => {
    const state = sessions.get(req.params.id);
    if (!state) return res.status(404).json({ status: 'not_found' });
    res.json(state);
});

module.exports = router;
