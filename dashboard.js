const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: 'postgres.ybefkucqzxqivjhazjnb',
  password: '#N9thbx&D*azkA',
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
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

    // 1. Nombre total d'utilisateurs
    const totalRes = await client.query('SELECT COUNT(*) FROM active_bots');
    const total = parseInt(totalRes.rows[0].count, 10);

    // 2. Statistiques par pays
    const countriesRes = await client.query(
      'SELECT country, COUNT(*) as count FROM active_bots GROUP BY country ORDER BY count DESC'
    );
    const countries = countriesRes.rows.map(row => ({
      country: row.country,
      count: parseInt(row.count, 10)
    }));

    // 3. Statistiques par plateforme (Koyeb, Render, Panel, etc.)
    const platformsRes = await client.query(
      "SELECT COALESCE(platform, 'Autre') as platform, COUNT(*) as count FROM active_bots GROUP BY platform ORDER BY count DESC"
    );
    const platforms = platformsRes.rows.map(row => ({
      platform: row.platform,
      count: parseInt(row.count, 10)
    }));

    // 4. Vue avancée (tous les bots)
    const botsRes = await client.query(
      'SELECT session_id, owner_name, owner_number, country, platform, last_active FROM active_bots ORDER BY last_active DESC'
    );
    const bots = botsRes.rows;

    res.json({
      total,
      countries,
      platforms,
      bots
    });
  } catch (err) {
    console.error('[DASHBOARD API ERR] :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
