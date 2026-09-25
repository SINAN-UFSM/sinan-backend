import { eq } from 'drizzle-orm';

import { db } from '#shared/infra/database/drizzle/connection';
import { usersTable, unitsTable, type DbUser, type DbUserInsert } from '#shared/infra/database/drizzle/schema';
import { NotFoundError } from '#shared/errors/HttpErrors';

import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';
import { User, type UserProps } from '#modules/users/entities/User';
import { Password } from '#modules/users/value-objects/Password';
import { Email } from '#modules/users/value-objects/Email';

class DrizzleUserRepository implements UserRepositoryPort {

    public async save(user: User): Promise<User> {
        const unitId = await this.resolveUnitId(user.unitId);
        const rawData = {
            name: user.name,
            email: user.email.value,
            hashedPassword: user.hashedPassword.value,
            role: user.role,
            unitId
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
        if (user.unitId !== undefined) updateData.unitId = await this.resolveUnitId(user.unitId);

        const [dbUser] = await db.update(usersTable)
            .set(updateData)
            .where(eq(usersTable.publicId, id))
            .returning();

        return this.mapToDomain(dbUser);
    }

    public async delete(id: string): Promise<void> {
        await db.delete(usersTable).where(eq(usersTable.publicId, id));
    }

    public async findById(id: string): Promise<User | null> {
        const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.publicId, id));
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
    private async mapToDomain(dbUser: DbUser): Promise<User> {
        const [unit] = await db.select({ publicId: unitsTable.publicId })
            .from(unitsTable)
            .where(eq(unitsTable.id, dbUser.unitId));

        if (!unit) {
            throw new NotFoundError(`Unit with internal ID ${dbUser.unitId} not found`);
        }

        const hashedPassword = Password.fromPersisted(dbUser.hashedPassword);
        const email = Email.fromPersisted(dbUser.email);
        return User.reconstitute({
            publicId: dbUser.publicId,
            name: dbUser.name,
            email: email,
            hashedPassword: hashedPassword,
            role: dbUser.role,
            unitId: unit.publicId
        });
    }

    private async resolveUnitId(publicId: string): Promise<number> {
        const [unit] = await db.select({ id: unitsTable.id })
            .from(unitsTable)
            .where(eq(unitsTable.publicId, publicId));

        if (!unit) {
            throw new NotFoundError(`Unit with ID ${publicId} not found`);
        }

        return unit.id;
    }
}

export { DrizzleUserRepository };