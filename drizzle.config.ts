import { defineConfig } from 'drizzle-kit';
import process from 'process';

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