import { BadRequestError } from '#errors/HttpErrors';

class Email {
    private readonly email: string;

    private constructor(email: string) {
        this.email = email;
    }

    public static create(email: string): Email {
        if (!this.validateEmail(email)) {
            throw new BadRequestError('Invalid email format');
        }
        return new Email(email);
    }

    private static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public static fromPersisted(email: string): Email {
        return new Email(email);
    }

    get value(): string {
        return this.email;
    }
}

export { Email };