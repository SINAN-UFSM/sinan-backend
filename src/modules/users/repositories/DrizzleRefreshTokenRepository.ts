import type { RefreshTokenRepositoryPort } from '#modules/users/ports/RefreshTokenRepositoryPort';

import { db } from '#shared/infra/database/drizzle/connection';
import { refreshTokensTable, usersTable } from '#shared/infra/database/drizzle/schema';
import { RefreshToken } from '#modules/users/entities/RefreshToken';
import { NotFoundError } from '#shared/errors/HttpErrors';
import { and, eq } from 'drizzle-orm';

class DrizzleRefreshTokenRepository implements RefreshTokenRepositoryPort {
    public async save(refreshToken: RefreshToken): Promise<void> {
        const [user] = await db.select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.publicId, refreshToken.UserId));

        if (!user) {
            throw new NotFoundError(`User with ID ${refreshToken.UserId} not found`);
        }

        await db.insert(refreshTokensTable).values({
            userId: user.id,
            tokenHash: refreshToken.Hash,
            expiresAt: refreshToken.ExpiresAt,
            revoked: false,
            createdAt: new Date(),
        });
    }
    public async findByHash(hash: string): Promise<RefreshToken | null> {
        const result = await db.select({
            userId: usersTable.publicId,
            tokenHash: refreshTokensTable.tokenHash,
            expiresAt: refreshTokensTable.expiresAt,
        })
            .from(refreshTokensTable)
            .innerJoin(usersTable, eq(refreshTokensTable.userId, usersTable.id))
            .where(eq(refreshTokensTable.tokenHash, hash));

        if (!result || result.length === 0) {
            return null;
        }

        const row = result[0];

        return RefreshToken.create(row.userId, row.tokenHash, row.expiresAt);
    }

    public async delete(hash: string): Promise<void> {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.tokenHash, hash));
    }

    public async consumeByHash(hash: string): Promise<RefreshToken | null> {
        const deletedToken = await db.transaction(async (tx) => {
            const [token] = await tx.select({
                userId: usersTable.publicId,
                tokenHash: refreshTokensTable.tokenHash,
                expiresAt: refreshTokensTable.expiresAt,
            })
                .from(refreshTokensTable)
                .innerJoin(usersTable, eq(refreshTokensTable.userId, usersTable.id))
                .where(and(eq(refreshTokensTable.tokenHash, hash), eq(refreshTokensTable.revoked, false)));

            if (!token) {
                return [];
            }

            await tx.delete(refreshTokensTable)
                .where(eq(refreshTokensTable.tokenHash, hash));

            return [token];
        });

        if (!deletedToken || deletedToken.length === 0) {
            return null;
        }

        const row = deletedToken[0];

        return RefreshToken.create(row.userId, row.tokenHash, row.expiresAt);
    }
}

export { DrizzleRefreshTokenRepository };