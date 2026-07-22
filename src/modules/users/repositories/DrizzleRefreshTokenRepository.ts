import type { RefreshTokenRepositoryPort } from '#modules/users/ports/RefreshTokenRepositoryPort';

import { db } from '#infra/database/drizzle/connection';
import { refreshTokensTable } from '#infra/database/drizzle/schema';
import { RefreshToken } from '../entities/RefreshToken.js';
import { eq } from 'drizzle-orm';

class DrizzleRefreshTokenRepository implements RefreshTokenRepositoryPort {
    public async save(refreshToken: RefreshToken): Promise<void> {
        await db.insert(refreshTokensTable).values({
            userId: refreshToken.userId,
            tokenHash: refreshToken.hash,
            expiresAt: refreshToken.expiresAt,
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

}

export { DrizzleRefreshTokenRepository };