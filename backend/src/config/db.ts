import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/index.ts';
import { env } from './env.ts';
import { logger } from './logger.ts';

const connectionString =
  env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  max: 20,
});

pool.on('error', (err: unknown) => {
  logger.error(err, '❌ Unexpected database error:');
  process.exit(1);
});

export const db = drizzle(pool, { schema });

export const closeDb = async () => {
  logger.info('Closing database pool');
  await pool.end();
};
