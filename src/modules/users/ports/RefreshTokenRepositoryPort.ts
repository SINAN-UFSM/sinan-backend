import type { RefreshToken } from '#modules/users/entities/RefreshToken';

export interface RefreshTokenRepositoryPort {
    save(refreshToken: RefreshToken): Promise<void>;
    findByHash(hash: string): Promise<RefreshToken | null>;
    delete(hash: string): Promise<void>;
    consumeByHash(hash: string): Promise<RefreshToken | null>;
}