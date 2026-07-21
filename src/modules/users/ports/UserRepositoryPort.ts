import type { User, UserProps } from '#modules/users/entities/User';

interface UserRepositoryPort {
    save(user: User): Promise<User>;
    update(id: string, user: Partial<UserProps>): Promise<User>;
}

export type { UserRepositoryPort };