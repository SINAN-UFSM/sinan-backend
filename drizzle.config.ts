import { defineConfig } from 'drizzle-kit';
import process from 'process';

export default defineConfig({
    dialect: 'postgresql',

    schema: './src/infra/database/drizzle/schema.ts',

    out: './drizzle',

    dbCredentials: {
        url: process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL is not defined'); })(),
    },
});