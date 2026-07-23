import { defineConfig } from 'drizzle-kit';
import process from 'process';

const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
} = process.env;

if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
        'Drizzle config error: Environment variables POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are required.'
    );
}

const port = Number(POSTGRES_PORT);
if (!POSTGRES_PORT || Number.isNaN(port) || !Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
        'Drizzle config error: POSTGRES_PORT must be provided and must be a valid integer between 1 and 65535.'
    );
}



export default defineConfig({
    dialect: 'postgresql',

    schema: './src/infra/database/drizzle/schema.ts',

    out: './drizzle',

    dbCredentials: {
        host: process.env.POSTGRES_HOST as string,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER as string,
        password: process.env.POSTGRES_PASSWORD as string,
        database: process.env.POSTGRES_DB as string,
    },
});