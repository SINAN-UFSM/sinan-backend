import type { RefreshTokenRepositoryPort } from '#modules/users/ports/RefreshTokenRepositoryPort';

import { db } from '#infra/database/drizzle/connection';
import { refreshTokensTable } from '#infra/database/drizzle/schema';
import { RefreshToken } from '../entities/RefreshToken.js';
import { eq } from 'drizzle-orm';

class DrizzleRefreshTokenRepository implements RefreshTokenRepositoryPort {
    public async save(refreshToken: RefreshToken): Promise<void> {
        await db.insert(refreshTokensTable).values({
            userId: refreshToken.UserId,
            tokenHash: refreshToken.Hash,
            expiresAt: refreshToken.ExpiresAt,
            revoked: false,
            createdAt: new Date(),
        });
    }
    public async findByHash(hash: string): Promise<RefreshToken | null> {
        const result = await db.select().from(refreshTokensTable).where(eq(refreshTokensTable.tokenHash, hash));

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
        const deletedToken = await db.delete(refreshTokensTable)
            .where(eq(refreshTokensTable.tokenHash, hash))
            .returning();

        if (!deletedToken || deletedToken.length === 0) {
            return null;
        }

        const row = deletedToken[0];

        return RefreshToken.create(row.userId, row.tokenHash, row.expiresAt);
    }
}

export { DrizzleRefreshTokenRepository };