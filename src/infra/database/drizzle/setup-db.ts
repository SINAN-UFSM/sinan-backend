import { migrate } from 'drizzle-orm/node-postgres/migrator';
import bcrypt from 'bcrypt';
import { db } from '#infra/database/drizzle/connection';
import { usersTable } from '#infra/database/drizzle/schema';

async function setupDatabase() {
    console.log('[Setup] Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[Setup] Migrations applied successfully!');

    const adminUsers = await db.select().from(usersTable).limit(1);

    if (adminUsers.length === 0) {
        console.log('[Setup] Database is empty. Creating the first administrator...');
        const adminPassword = process.env.ADMIN_PASSWORD
        const adminEmail = process.env.ADMIN_EMAIL

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
        console.log('[Setup] First administrator created successfully!');

        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await db.insert(usersTable).values({
            name: 'System Administrator',
            email: adminEmail,
            hashedPassword: passwordHash,
            role: 'admin',
            unitId: 1
        });
    } else {
        console.log('[Setup] Database already has users. Seed skipped.');
    }
}

setupDatabase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('[Setup] Critical error while setting up database:', err);
        process.exit(1);
    });