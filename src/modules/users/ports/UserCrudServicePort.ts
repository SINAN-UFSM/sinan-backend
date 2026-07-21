import type { User } from '#modules/users/entities/User';


type CreateUserDTO = {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    unitId: number;
};

type UpdateUserDTO = {
    name?: string;
    email?: string;
    role?: 'admin' | 'user';
    unitId?: number;
};

interface UserCrudServicePort {
    createUser(user: CreateUserDTO): Promise<User>;
    updateUser(id: string, user: UpdateUserDTO): Promise<User>;
}

export type { CreateUserDTO, UpdateUserDTO, UserCrudServicePort };