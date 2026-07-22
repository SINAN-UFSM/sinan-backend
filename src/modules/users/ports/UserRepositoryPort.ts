import type { User, UserProps } from '#modules/users/entities/User';

interface UserRepositoryPort {
    save(user: User): Promise<User>;
    update(id: string, user: Partial<UserProps>): Promise<User>;
    delete(id: string): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}

export type { UserRepositoryPort };