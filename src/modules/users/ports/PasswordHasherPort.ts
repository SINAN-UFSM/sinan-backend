interface PasswordHasherPort {
    hash(plainPassword: string): Promise<string>;
    compare(plainPassword: string, hashedValue: string): Promise<boolean>;
}

export type { PasswordHasherPort };