const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    user:     'postgres.ybefkucqzxqivjhazjnb',
    password: '#N9thbx&D*azkA',
    host:     'aws-1-eu-central-1.pooler.supabase.com',
    port:     6543,
    database: 'postgres',
    ssl:      { rejectUnauthorized: false }
});

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

router.post('/stats', async (req, res) => {
    const { password } = req.body;

    if (!password || password !== DASHBOARD_PASSWORD) {
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Migrations douces au cas où les colonnes n'existent pas encore
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS bot_url TEXT;`).catch(() => {});
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;`).catch(() => {});
        await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS uptime_sec BIGINT;`).catch(() => {});

        // 1. Totaux
        const totalRes   = await client.query('SELECT COUNT(*) FROM active_bots');
        const onlineRes  = await client.query('SELECT COUNT(*) FROM active_bots WHERE is_online = TRUE');
        const total      = parseInt(totalRes.rows[0].count,  10);
        const totalOnline = parseInt(onlineRes.rows[0].count, 10);

        // 2. Pays
        const countriesRes = await client.query(
            'SELECT country, COUNT(*) as count FROM active_bots GROUP BY country ORDER BY count DESC'
        );
        const countries = countriesRes.rows.map(r => ({ country: r.country, count: parseInt(r.count, 10) }));

        // 3. Plateformes
        const platformsRes = await client.query(
            `SELECT COALESCE(platform, 'Autre') as platform, COUNT(*) as count FROM active_bots GROUP BY platform ORDER BY count DESC`
        );
        const platforms = platformsRes.rows.map(r => ({ platform: r.platform, count: parseInt(r.count, 10) }));

        // 4. Liste complète des bots (vue avancée)
        const botsRes = await client.query(
            `SELECT session_id, owner_name, owner_number, country, platform,
                    bot_url, is_online, uptime_sec, last_active
             FROM active_bots
             ORDER BY is_online DESC, last_active DESC`
        );
        const bots = botsRes.rows;

        res.json({ total, totalOnline, countries, platforms, bots });

    } catch (err) {
        console.error('[DASHBOARD API ERR] :', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
