import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS bot_url TEXT;`).catch(() => {});
      await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;`).catch(() => {});
      await client.query(`ALTER TABLE active_bots ADD COLUMN IF NOT EXISTS uptime_sec BIGINT;`).catch(() => {});

      const totalRes = await client.query('SELECT COUNT(*) FROM active_bots');
      const onlineRes = await client.query('SELECT COUNT(*) FROM active_bots WHERE is_online = TRUE');
      const total = parseInt(totalRes.rows[0].count, 10);
      const totalOnline = parseInt(onlineRes.rows[0].count, 10);

      const countriesRes = await client.query(
        'SELECT country, COUNT(*) as count FROM active_bots GROUP BY country ORDER BY count DESC'
      );
      const countries = countriesRes.rows.map(r => ({ country: r.country, count: parseInt(r.count, 10) }));

      const platformsRes = await client.query(
        `SELECT COALESCE(platform, 'Autre') as platform, COUNT(*) as count FROM active_bots GROUP BY platform ORDER BY count DESC`
      );
      const platforms = platformsRes.rows.map(r => ({ platform: r.platform, count: parseInt(r.count, 10) }));

      const botsRes = await client.query(
        `SELECT session_id, owner_name, owner_number, country, platform,
                bot_url, is_online, uptime_sec, last_active
         FROM active_bots
         ORDER BY is_online DESC, last_active DESC`
      );
      const bots = botsRes.rows;

      return NextResponse.json({ total, totalOnline, countries, platforms, bots });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[DASHBOARD STATS ERR] :', err);
    return NextResponse.json({ error: 'Erreur lors de la récupération des données.' }, { status: 500 });
  }
}
