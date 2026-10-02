const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
    user:     process.env.PG_USER     || 'postgres.ybefkucqzxqivjhazjnb',
    password: process.env.PG_PASSWORD || '#N9thbx&D*azkA',
    host:     process.env.PG_HOST     || 'aws-1-eu-central-1.pooler.supabase.com',
    port:     parseInt(process.env.PG_PORT || '6543'),
    database: process.env.PG_DB       || 'postgres',
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

router.post('/delete-bot', async (req, res) => {
    const { password, session_id } = req.body;

    if (!password || password !== DASHBOARD_PASSWORD) {
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID requis.' });
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query('DELETE FROM active_bots WHERE session_id = $1', [session_id]);
        if (result.rowCount === 0) {
            return res.status(444).json({ error: 'Bot non trouvé.' });
        }
        res.json({ success: true, message: 'Bot supprimé avec succès.' });
    } catch (err) {
        console.error('[DASHBOARD DELETE ERR] :', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du bot.' });
    } finally {
        if (client) client.release();
    }
});

router.post('/cleanup', async (req, res) => {
    const { password } = req.body;

    if (!password || password !== DASHBOARD_PASSWORD) {
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    let client;
    try {
        client = await pool.connect();

        // 1. Supprimer les doublons hors ligne pour un même numéro (garder la plus récente)
        const dupRes = await client.query(`
            DELETE FROM active_bots
            WHERE is_online = FALSE
              AND session_id NOT IN (
                  SELECT DISTINCT ON (owner_number) session_id
                  FROM active_bots
                  ORDER BY owner_number, is_online DESC, last_active DESC
              )
        `);

        // 2. Supprimer les bots hors ligne dont la dernière activité remonte à plus de 24h
        const expireRes = await client.query(`
            DELETE FROM active_bots
            WHERE is_online = FALSE
              AND (last_active < NOW() - INTERVAL '24 hours' OR last_active IS NULL)
        `);

        const deletedDuplicates = dupRes.rowCount || 0;
        const deletedExpired = expireRes.rowCount || 0;

        res.json({
            success: true,
            message: `Purger effectuée : ${deletedDuplicates} doublon(s) et ${deletedExpired} bot(s) inactif(s) (>24h) supprimé(s).`,
            deletedDuplicates,
            deletedExpired
        });

    } catch (err) {
        console.error('[DASHBOARD CLEANUP ERR] :', err);
        res.status(500).json({ error: 'Erreur lors de la purge de la base de données.' });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
