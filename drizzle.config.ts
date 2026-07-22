import { defineConfig } from 'drizzle-kit';
import process from 'process';

export default defineConfig({
    dialect: 'postgresql',

    schema: './src/infra/database/drizzle/schema.ts',

    out: './drizzle',

    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgres://admin:senha_super_secreta@localhost:5432/sinan_db',
    },
});