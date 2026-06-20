/**
 * pinger.js — Service de ping centralisé
 * Le site session-web est le seul qui ping les bots.
 * Chaque bot enregistre son URL dans Supabase via supabaseTelemetry.
 * Ce service interroge la base, ping chaque URL /health et met à jour is_online.
 *
 * Gestion des sessions obsolètes :
 *  - Si /health renvoie un sessionId différent de celui en DB → ancienne session marquée HORS LIGNE
 *  - Le bot_url est transféré vers la nouvelle session si elle est déjà enregistrée
 */

const axios  = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    user:     'postgres.ybefkucqzxqivjhazjnb',
    password: '#N9thbx&D*azkA',
    host:     'aws-1-eu-central-1.pooler.supabase.com',
    port:     6543,
    database: 'postgres',
    ssl:      { rejectUnauthorized: false }
});

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const PING_TIMEOUT_MS  = 10_000;         // 10s par bot

async function pingAllBots() {
    let client;
    try {
        client = await pool.connect();

        // Récupérer tous les bots qui ont une URL enregistrée
        const { rows } = await client.query(
            `SELECT session_id, bot_url FROM active_bots WHERE bot_url IS NOT NULL`
        );

        if (rows.length === 0) {
            console.log('[PINGER] Aucun bot avec URL enregistrée.');
            return;
        }

        console.log(`[PINGER] Ping de ${rows.length} bot(s)...`);

        const results = await Promise.allSettled(
            rows.map(async (bot) => {
                const url = bot.bot_url.replace(/\/$/, '') + '/health';
                try {
                    const resp = await axios.get(url, { timeout: PING_TIMEOUT_MS });

                    if (resp.status !== 200 || resp.data?.status !== 'online') {
                        return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId: null };
                    }

                    const realSessionId = resp.data?.sessionId || null;

                    // Si le bot renvoie un sessionId ET qu'il ne correspond pas → session fantôme
                    if (realSessionId && realSessionId !== bot.session_id) {
                        console.log(`[PINGER] ⚠️  Session obsolète détectée : DB="${bot.session_id.slice(0,18)}..." Réel="${realSessionId.slice(0,18)}..."`);
                        return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId };
                    }

                    return { session_id: bot.session_id, bot_url: bot.bot_url, online: true, uptime: resp.data?.uptime ?? null, realSessionId };
                } catch {
                    return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId: null };
                }
            })
        );

        // Mettre à jour en DB
        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            const { session_id, bot_url, online, uptime, realSessionId } = result.value;

            // ── Gestion des sessions fantômes (sessionId changé après reconnexion) ──
            if (!online && realSessionId && realSessionId !== session_id) {
                // Passer l'ancienne session hors ligne
                await client.query(
                    `UPDATE active_bots SET is_online = FALSE WHERE session_id = $1`, [session_id]
                ).catch(() => {});

                // Si la nouvelle session est déjà en DB, lui transférer le bot_url
                const { rowCount } = await client.query(
                    `UPDATE active_bots
                     SET bot_url = $1, is_online = TRUE, last_active = CURRENT_TIMESTAMP
                     WHERE session_id = $2`,
                    [bot_url, realSessionId]
                ).catch(() => ({ rowCount: 0 }));

                if (rowCount > 0) {
                    console.log(`[PINGER] 🔄 bot_url transféré → nouvelle session "${realSessionId.slice(0,18)}..."`);
                } else {
                    console.log(`[PINGER] ℹ️  Nouvelle session "${realSessionId.slice(0,18)}..." pas encore en DB — elle s'enregistrera d'elle-même.`);
                }

                console.log(`[PINGER] ❌ ${session_id.slice(0, 18)}... → HORS LIGNE (session obsolète)`);
                continue;
            }
            // ─────────────────────────────────────────────────────────────────────

            await client.query(
                `UPDATE active_bots
                 SET is_online   = $1,
                     last_active = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE last_active END,
                     uptime_sec  = COALESCE($2, uptime_sec)
                 WHERE session_id = $3`,
                [online, uptime, session_id]
            ).catch(async (err) => {
                // La colonne uptime_sec peut ne pas exister encore → migration douce
                if (err.message.includes('uptime_sec')) {
                    await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS uptime_sec BIGINT;`).catch(() => {});
                    await client.query(
                        `UPDATE active_bots SET is_online = $1, last_active = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE last_active END WHERE session_id = $2`,
                        [online, session_id]
                    );
                }
            });

            const icon = online ? '✅' : '❌';
            console.log(`[PINGER] ${icon} ${session_id.slice(0, 18)}... → ${online ? 'EN LIGNE' : 'HORS LIGNE'}`);
        }

    } catch (err) {
        console.error('[PINGER ERR]', err.message);
    } finally {
        if (client) client.release();
    }
}

/**
 * Démarre le service de ping en fond.
 * Appel immédiat au démarrage, puis toutes les PING_INTERVAL_MS.
 */
function startPinger() {
    console.log(`[PINGER] 🚀 Service démarré — ping toutes les ${PING_INTERVAL_MS / 60000} min`);
    pingAllBots(); // premier ping immédiat
    setInterval(pingAllBots, PING_INTERVAL_MS);
}

module.exports = { startPinger };
