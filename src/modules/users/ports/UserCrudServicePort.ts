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
    password?: string;
};

type UserResponseDTO = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    unitId: number;
};
interface UserCrudServicePort {
    createUser(user: CreateUserDTO): Promise<UserResponseDTO>;
    updateUser(id: string, user: UpdateUserDTO): Promise<UserResponseDTO>;
    deleteUser(id: string): Promise<void>;
}

export type { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserCrudServicePort };