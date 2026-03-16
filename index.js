import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import * as pkgBaileys from "@whiskeysockets/baileys";
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    jidNormalizedUser,
    Browsers,
    fetchLatestBaileysVersion
} = pkgBaileys;
import pino from 'pino';
import QRCode from 'qrcode';
import PastebinAPI from 'pastebin-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function makeid(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function startSession(id, type, number = null, res = null) {
    const tempPath = `./temp/${id}`;
    let sock;
    let qrSent = false;

    const connectionHandler = async () => {
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
            });

            sock.ev.on('creds.update', saveCreds);

            if (type === 'pair' && !sock.authState.creds.registered && number) {
                await delay(1500);
                const code = await sock.requestPairingCode(number.replace(/[^0-9]/g, ''));
                if (res && !res.headersSent) res.json({ code });
            }

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                console.log(`[${id}] Update: ${connection || 'pending'}, QR: ${!!qr}`);

                if (qr && type === 'qr' && !qrSent) {
                    qrSent = true;
                    if (res && !res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        res.send(await QRCode.toBuffer(qr));
                    }
                }

                if (connection === 'close') {
                    const reason = lastDisconnect?.error?.output?.statusCode;
                    console.error(`[${id}] Closed. Reason: ${reason}`);
                    if (reason !== 401) {
                        console.log(`[${id}] Reconnecting...`);
                        connectionHandler();
                    } else {
                        await fs.remove(tempPath).catch(() => { });
                    }
                }

                if (connection === 'open') {
                    console.log(`[${id}] Auth successful.`);
                    await delay(5000);
                    const credsFile = path.join(tempPath, 'creds.json');
                    if (await fs.pathExists(credsFile)) {
                        const data = await fs.readFile(credsFile, 'utf-8');
                        const paste = await pastebin.createPaste(data, 'MenMa-Md Session', null, 1, 'N');
                        const b64data = "MenMa-Md_" + paste.split('https://pastebin.com/')[1];
                        const message = `*🌟 MENMA-MD SESSION CONNECTED 🌟*\n\n` +
                            `> *ID* : \`${b64data}\`\n\n` +
                            `_Please keep this session ID private._\n\n` +
                            `*© 2024 Dr Djibi Team*`;
                        await sock.sendMessage(jidNormalizedUser(sock.user.id), { text: message });
                        console.log(`[${id}] Session sent: ${b64data}`);
                    }
                    await sock.ws.close();
                    await fs.remove(tempPath);
                }
            });

        } catch (err) {
            console.error(`[${id}] Error:`, err);
            if (res && !res.headersSent) res.status(500).send("Error");
        }
    };

    connectionHandler();
}

app.get('/api/qr', async (req, res) => {
    const id = makeid();
    console.log(`[QR-${id}] Starting...`);
    startSession(id, 'qr', null, res);
});

app.get('/api/pair', async (req, res) => {
    const id = makeid();
    const num = req.query.number;
    if (!num) return res.status(400).send("No number");
    console.log(`[Pair-${id}] Starting for ${num}`);
    startSession(id, 'pair', num, res);
});

app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pair.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'public', 'qr.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server on ${PORT}`));
