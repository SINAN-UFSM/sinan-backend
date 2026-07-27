import { z } from 'zod';
import type { PaginatedResponseDTO } from '#shared/dtos/paginated-query.dto';
import { uuidParamSchema } from '#shared/validators/common.validator';

export { uuidParamSchema };

const roleEnum = z.enum(['admin', 'user'], { message: 'Invalid role' });

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty'),
    email: z.email({ error: 'Invalid email format' }),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: roleEnum,
    unitId: z.coerce.number().int().positive('Unit ID must be a positive integer'),
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    email: z.email({ error: 'Invalid email format' }).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
    role: roleEnum.optional(),
    unitId: z.coerce.number().int().positive('Unit ID must be a positive integer').optional(),
});

export const readUsersQuerySchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: roleEnum.optional(),
    unitId: z.coerce.number().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional(),
});

type CreateUserDTO = z.infer<typeof createUserSchema>;

type UpdateUserDTO = {
    id: string;
} & z.infer<typeof updateUserSchema>;

type UserResponseDTO = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    unitId: number;
};

type UserFiltersDTO = z.infer<typeof readUsersQuerySchema>;
type ReadUsersQueryDTO = UserFiltersDTO;

interface UserCrudServicePort {
    createUser(userDTO: CreateUserDTO): Promise<UserResponseDTO>;
    updateUser(userDTO: UpdateUserDTO): Promise<UserResponseDTO>;
    deleteUser(id: string): Promise<void>;
    readUser(id: string): Promise<UserResponseDTO | null>;
    readUsers(queryDTO: ReadUsersQueryDTO): Promise<PaginatedResponseDTO<UserResponseDTO>>;
}

export type {
    CreateUserDTO,
    UpdateUserDTO,
    UserResponseDTO,
    ReadUsersQueryDTO,
    UserFiltersDTO,
    UserCrudServicePort
};