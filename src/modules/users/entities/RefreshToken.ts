
class RefreshToken {
    private readonly userId: string;
    private readonly hash: string;
    private readonly expiresAt: Date;

    private constructor(userId: string, hash: string, expiresAt: Date) {
        this.userId = userId;
        this.hash = hash;
        this.expiresAt = expiresAt;
    }

    public static create(userId: string, hash: string, expiresAt: Date): RefreshToken {
        if (!userId || !hash || !expiresAt) {
            throw new Error('Missing required fields for RefreshToken');
        }

        if (Number.isNaN(expiresAt.getTime())) {
            throw new Error('Invalid expiration date');
        }

        return new RefreshToken(userId, hash, expiresAt);
    }

    public isExpired(): boolean {
        return Date.now() >= this.expiresAt.getTime();
    }

    get UserId(): string {
        return this.userId;
    }

    get Hash(): string {
        return this.hash;
    }

    get ExpiresAt(): Date {
        return this.expiresAt;
    }
}

export { RefreshToken };