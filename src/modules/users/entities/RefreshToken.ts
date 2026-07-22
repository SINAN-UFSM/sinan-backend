
class RefreshToken {
    public readonly userId: string;
    public readonly hash: string;
    public readonly expiresAt: Date;

    private constructor(userId: string, hash: string, expiresAt: Date) {
        this.userId = userId;
        this.hash = hash;
        this.expiresAt = expiresAt;
    }

    public static create(userId: string, hash: string, expiresAt: Date): RefreshToken {
        if (!userId || !hash || !expiresAt) {
            throw new Error('Missing required fields for RefreshToken');
        }
        return new RefreshToken(userId, hash, expiresAt);
    }

    public isExpired(): boolean {
        return new Date() > this.expiresAt;
    }
}

export { RefreshToken };