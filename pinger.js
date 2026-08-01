/**
 * pinger.js — Service de ping centralisé
 * Ne ping QUE les bots marqués is_online = TRUE avec une bot_url enregistrée.
 * Gère les sessions fantômes (sessionId changé après reconnexion du bot).
 */

require('dotenv').config();

const axios  = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    user:     process.env.PG_USER     || 'postgres.ybefkucqzxqivjhazjnb',
    password: process.env.PG_PASSWORD || '#N9thbx&D*azkA',
    host:     process.env.PG_HOST     || 'aws-1-eu-central-1.pooler.supabase.com',
    port:     parseInt(process.env.PG_PORT || '6543'),
    database: process.env.PG_DB       || 'postgres',
    ssl:      { rejectUnauthorized: false }
});

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const PING_TIMEOUT_MS  = 10_000;         // 10s par bot

async function pingAllBots() {
    let client;
    try {
        client = await pool.connect();

        // Migration douce — s'assure que les colonnes nécessaires existent
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS bot_url   TEXT;`).catch(() => {});
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;`).catch(() => {});
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS uptime_sec BIGINT;`).catch(() => {});

        // Récupérer UNIQUEMENT les bots actifs avec une URL enregistrée
        const { rows } = await client.query(
            `SELECT session_id, bot_url FROM active_bots WHERE bot_url IS NOT NULL AND is_online = TRUE`
        );

        if (rows.length === 0) {
            console.log('[PINGER] Aucun bot en ligne à pinger.');
            return;
        }

        console.log(`[PINGER] 🔍 Ping de ${rows.length} bot(s) en ligne...`);

        const results = await Promise.allSettled(
            rows.map(async (bot) => {
                const url = bot.bot_url.replace(/\/$/, '') + '/health';
                try {
                    const resp = await axios.get(url, { timeout: PING_TIMEOUT_MS });

                    if (resp.status !== 200 || resp.data?.status !== 'online') {
                        return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId: null };
                    }

                    const realSessionId = resp.data?.sessionId || null;

                    // Session fantôme : le bot a changé de session_id (ex: redémarrage)
                    if (realSessionId && realSessionId !== bot.session_id) {
                        console.log(`[PINGER] ⚠️  Session obsolète — DB: "${bot.session_id.slice(0, 18)}..." Réel: "${realSessionId.slice(0, 18)}..."`);
                        return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId };
                    }

                    return { session_id: bot.session_id, bot_url: bot.bot_url, online: true, uptime: resp.data?.uptime ?? null, realSessionId };
                } catch {
                    return { session_id: bot.session_id, bot_url: bot.bot_url, online: false, uptime: null, realSessionId: null };
                }
            })
        );

        // Mise à jour en DB
        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            const { session_id, bot_url, online, uptime, realSessionId } = result.value;

            // ── Gestion session fantôme ───────────────────────────────────────
            if (!online && realSessionId && realSessionId !== session_id) {
                // Ancienne session → hors ligne
                await client.query(
                    `UPDATE active_bots SET is_online = FALSE WHERE session_id = $1`,
                    [session_id]
                ).catch(() => {});

                // Si la nouvelle session est déjà en DB → lui transférer le bot_url
                const { rowCount } = await client.query(
                    `UPDATE active_bots
                     SET bot_url = $1, is_online = TRUE, last_active = CURRENT_TIMESTAMP
                     WHERE session_id = $2`,
                    [bot_url, realSessionId]
                ).catch(() => ({ rowCount: 0 }));

                if (rowCount > 0) {
                    console.log(`[PINGER] 🔄 bot_url transféré → nouvelle session "${realSessionId.slice(0, 18)}..."`);
                } else {
                    console.log(`[PINGER] ℹ️  Nouvelle session "${realSessionId.slice(0, 18)}..." pas encore en DB — elle s'enregistrera seule.`);
                }

                console.log(`[PINGER] ❌ ${session_id.slice(0, 18)}... → HORS LIGNE (session obsolète)`);
                continue;
            }
            // ─────────────────────────────────────────────────────────────────

            await client.query(
                `UPDATE active_bots
                 SET is_online   = $1,
                     last_active = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE last_active END,
                     uptime_sec  = COALESCE($2, uptime_sec)
                 WHERE session_id = $3`,
                [online, uptime, session_id]
            ).catch(() => {});

            const icon = online ? '✅' : '❌';
            const label = online ? 'EN LIGNE' : 'HORS LIGNE';
            console.log(`[PINGER] ${icon} ${session_id.slice(0, 18)}... → ${label}`);
        }

    } catch (err) {
        console.error('[PINGER ERR]', err.message);
    } finally {
        if (client) client.release();
    }
}

/**
 * Démarre le service de ping en fond.
 * Premier ping immédiat, puis toutes les PING_INTERVAL_MS.
 */
function startPinger() {
    console.log(`[PINGER] 🚀 Démarré — ping toutes les ${PING_INTERVAL_MS / 60000} min`);
    pingAllBots();
    setInterval(pingAllBots, PING_INTERVAL_MS);
}

module.exports = { startPinger };
