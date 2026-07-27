import { BadRequestError } from '#shared/errors/HttpErrors';

class Password {
    private readonly passwordValue: string;
    private readonly isHashed: boolean;

    private constructor(passwordValue: string, isHashed: boolean) {
        this.passwordValue = passwordValue;
        this.isHashed = isHashed;
    }

    public static create(plainPassword: string): Password {
        this.validatePassword(plainPassword);
        return new Password(plainPassword, false);
    }

    public static fromPersisted(existingHash: string): Password {
        return new Password(existingHash, true);
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
        return this.passwordValue;
    }

    public get hashed(): boolean {
        return this.isHashed;
    }
}

export { Password };