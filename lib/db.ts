import { Pool } from 'pg';

export const pool = new Pool({
  user:     process.env.PG_USER     || 'postgres.ybefkucqzxqivjhazjnb',
  password: process.env.PG_PASSWORD || '#N9thbx&D*azkA',
  host:     process.env.PG_HOST     || 'aws-1-eu-central-1.pooler.supabase.com',
  port:     parseInt(process.env.PG_PORT || '6543'),
  database: process.env.PG_DB       || 'postgres',
  ssl:      { rejectUnauthorized: false }
});
