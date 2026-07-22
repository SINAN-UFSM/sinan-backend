import type { CreateUserDTO, UserResponseDTO, UpdateUserDTO, UserCrudServicePort } from '#modules/users/ports/UserCrudServicePort';
import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';

import { User, type UserProps } from "#modules/users/entities/User";

import { HashedPassword } from '../value-objects/HashedPassword.js';
import { Email } from '../value-objects/Email.js';
import { BadRequestError, NotFoundError } from '#errors/HttpErrors';

class UserCrudService implements UserCrudServicePort {
    private userRepository: UserRepositoryPort;

    constructor(userRepository: UserRepositoryPort) {
        this.userRepository = userRepository;
    }

    async createUser(userDTO: CreateUserDTO): Promise<UserResponseDTO> {

        const hashedPassword = await HashedPassword.create(userDTO.password);
        const email = Email.create(userDTO.email);

        const existingUser = await this.userRepository.findByEmail(email.value);
        if (existingUser) {
            throw new BadRequestError('Email is already in use');
        }

        const domainUser = User.create(
            userDTO.name,
            email,
            hashedPassword,
            userDTO.role,
            userDTO.unitId
        );
        const dbUser = await this.userRepository.save(domainUser);
        return {
            id: dbUser.id as string,
            name: dbUser.name,
            email: dbUser.email.value,
            role: dbUser.role,
            unitId: dbUser.unitId
        };
    }

    async updateUser(id: string, userDTO: UpdateUserDTO): Promise<UserResponseDTO> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        const email = userDTO.email ? Email.create(userDTO.email) : undefined;
        const hashedPassword = userDTO.password ? await HashedPassword.create(userDTO.password) : undefined;

        if (email && email.value !== existingUser.email.value) {
            const emailTaken = await this.userRepository.findByEmail(email.value);
            if (emailTaken) {
                throw new BadRequestError('Email is already in use by another account');
            }
        }
        const userProps: Partial<UserProps> = {
            name: userDTO.name,
            email: email,
            hashedPassword: hashedPassword,
            role: userDTO.role,
            unitId: userDTO.unitId
        };

        const updatedUser = await this.userRepository.update(id, userProps);

        if (!updatedUser) {
            throw new BadRequestError('Failed to update user');
        }

        return {
            id: updatedUser.id as string,
            name: updatedUser.name,
            email: updatedUser.email.value,
            role: updatedUser.role,
            unitId: updatedUser.unitId
        };
    }

    async deleteUser(id: string): Promise<void> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        await this.userRepository.delete(id);
    }
}

export { UserCrudService };