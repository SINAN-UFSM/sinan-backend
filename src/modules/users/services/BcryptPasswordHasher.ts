import bcrypt from 'bcrypt';
import type { PasswordHasherPort } from '#modules/users/ports/PasswordHasherPort';

export class BcryptPasswordHasher implements PasswordHasherPort {
    private readonly saltRounds = 10;

    public async hash(plainPassword: string): Promise<string> {
        return await bcrypt.hash(plainPassword, this.saltRounds);
    }

    public async compare(plainPassword: string, hashedValue: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedValue);
    }
}