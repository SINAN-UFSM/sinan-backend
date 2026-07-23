import { eq } from 'drizzle-orm';

import { db } from '#shared/infra/database/drizzle/connection';
import { usersTable, type DbUser, type DbUserInsert } from '#shared/infra/database/drizzle/schema';

import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';
import { User, type UserProps } from '#modules/users/entities/User';
import { HashedPassword } from '#modules/users/value-objects/HashedPassword';
import { Email } from '../value-objects/Email.js';

class DrizzleUserRepository implements UserRepositoryPort {

    public async save(user: User): Promise<User> {
        const rawData = {
            name: user.name,
            email: user.email.value,
            hashedPassword: user.hashedPassword.value,
            role: user.role,
            unitId: user.unitId
        };

        const [dbUser] = await db.insert(usersTable)
            .values(rawData)
            .returning();

        return this.mapToDomain(dbUser);
    }

    public async update(id: string, user: Partial<UserProps>): Promise<User> {
        const updateData: Partial<DbUserInsert> = {};

        if (user.name !== undefined) updateData.name = user.name;
        if (user.email !== undefined) updateData.email = user.email.value;
        if (user.hashedPassword !== undefined) updateData.hashedPassword = user.hashedPassword.value;
        if (user.role !== undefined) updateData.role = user.role;
        if (user.unitId !== undefined) updateData.unitId = user.unitId;

        const [dbUser] = await db.update(usersTable)
            .set(updateData)
            .where(eq(usersTable.id, id))
            .returning();

        return this.mapToDomain(dbUser);
    }

    public async delete(id: string): Promise<void> {
        await db.delete(usersTable).where(eq(usersTable.id, id));
    }

    public async findById(id: string): Promise<User | null> {
        const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, id));
        if (!dbUser) {
            return null;
        }

        return this.mapToDomain(dbUser);
    }

    public async findByEmail(email: string): Promise<User | null> {
        const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        if (!dbUser) {
            return null;
        }

        return this.mapToDomain(dbUser);

    }
    private mapToDomain(dbUser: DbUser): User {
        const hashedPassword = HashedPassword.fromPersisted(dbUser.hashedPassword);
        const email = Email.fromPersisted(dbUser.email);
        return User.reconstitute({
            id: dbUser.id,
            name: dbUser.name,
            email: email,
            hashedPassword: hashedPassword,
            role: dbUser.role,
            unitId: dbUser.unitId
        });
    }
}

export { DrizzleUserRepository };