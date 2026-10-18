import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, session_id } = body;

    if (!password || password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID requis.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM active_bots WHERE session_id = $1', [session_id]);
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Bot non trouvé.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Bot supprimé avec succès.' });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[DASHBOARD DELETE ERR] :', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression du bot.' }, { status: 500 });
  }
}
