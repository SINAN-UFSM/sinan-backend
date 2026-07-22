import bcrypt from 'bcrypt';
import { BadRequestError } from '#errors/HttpErrors';

class HashedPassword {
    private readonly hashedPassword: string;

    private constructor(hashedPassword: string) {
        this.hashedPassword = hashedPassword;
    }

    public static async create(plainPassword: string): Promise<HashedPassword> {
        this.validatePassword(plainPassword);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        return new HashedPassword(hashedPassword);
    }

    public static fromPersisted(existingHash: string): HashedPassword {
        return new HashedPassword(existingHash);
    }

    private static validatePassword(plainPassword: string): void {
        if (plainPassword.length < 8) {
            throw new BadRequestError('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(plainPassword)) {
            throw new BadRequestError('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(plainPassword)) {
            throw new BadRequestError('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(plainPassword)) {
            throw new BadRequestError('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(plainPassword)) {
            throw new BadRequestError('Password must contain at least one special character');
        }
    }

    public get value(): string {
        return this.hashedPassword;
    }

    public async compare(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this.hashedPassword);
    }
}

export { HashedPassword };