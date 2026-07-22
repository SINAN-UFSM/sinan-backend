import { migrate } from 'drizzle-orm/node-postgres/migrator';
import bcrypt from 'bcrypt';
import { db, pool } from '#infra/database/drizzle/connection';
import { usersTable } from '#infra/database/drizzle/schema';
import { eq } from 'drizzle-orm';

async function setupDatabase() {
    console.log('[Setup] Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[Setup] Migrations applied successfully!');

    await db.transaction(async (tx) => {
        await tx.execute(`SELECT pg_advisory_xact_lock(999999);`);

        const existingAdmins = await tx
            .select()
            .from(usersTable)
            .where(eq(usersTable.role, 'admin'))
            .limit(1);

        if (existingAdmins.length > 0) {
            console.log('[Setup] Administrator already exists. Seed skipped.');
            return;
        }

        console.log('[Setup] Database is empty. Creating the first administrator...');
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminPassword || !adminEmail) {
            throw new Error('ADMIN_PASSWORD and ADMIN_EMAIL must be defined in the environment variables');
        }

        if (adminPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(adminPassword)) {
            throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(adminPassword)) {
            throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(adminPassword)) {
            throw new Error('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(adminPassword)) {
            throw new Error('Password must contain at least one special character');
        }

        if (Buffer.byteLength(adminPassword, 'utf-8') > 72) {
            throw new Error('Password must not exceed 72 bytes in length');
        }

        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await tx.insert(usersTable).values({
            name: 'System Administrator',
            email: adminEmail,
            hashedPassword: passwordHash,
            role: 'admin',
            unitId: 1
        }).onConflictDoNothing({ target: usersTable.email });

        console.log('[Setup] First administrator created successfully!');
    });
}

setupDatabase()
    .then(async () => {
        await pool.end();
        process.exit(0);
    })
    .catch(async err => {
        console.error('[Setup] Critical error while setting up database:', err);
        await pool.end();
        process.exit(1);
    });