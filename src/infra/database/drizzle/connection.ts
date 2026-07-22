import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sinan';

const pool = new Pool({
    connectionString,
});

const db = drizzle(pool);

export { db };