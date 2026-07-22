type CreateUserDTO = {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    unitId: number;
};

type UserResponseDTO = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    unitId: number;
};

type UpdateUserDTO = Partial<CreateUserDTO>;

interface UserCrudServicePort {
    createUser(user: CreateUserDTO): Promise<UserResponseDTO>;
    updateUser(id: string, user: UpdateUserDTO): Promise<UserResponseDTO>;
    deleteUser(id: string): Promise<void>;
}

export type { CreateUserDTO, UserResponseDTO, UpdateUserDTO, UserCrudServicePort };