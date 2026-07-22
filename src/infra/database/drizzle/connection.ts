import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL is not defined'); })();

const pool = new Pool({
    connectionString,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const db = drizzle(pool);

export { db, pool };