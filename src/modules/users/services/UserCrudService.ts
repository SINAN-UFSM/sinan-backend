import type {
    CreateUserDTO,
    UserResponseDTO,
    UpdateUserDTO,
    UserCrudServicePort
} from '#modules/users/ports/UserCrudServicePort';
import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';
import type { PasswordHasherPort } from '#modules/users/ports/PasswordHasherPort';

import { User, type UserProps } from "#modules/users/entities/User";

import { Password } from '#modules/users/value-objects/Password';
import { Email } from '#modules/users/value-objects/Email';
import { BadRequestError, NotFoundError } from '#shared/errors/HttpErrors';

class UserCrudService implements UserCrudServicePort {
    private userRepository: UserRepositoryPort;
    private passwordHasher: PasswordHasherPort;

    constructor(
        userRepository: UserRepositoryPort,
        passwordHasher: PasswordHasherPort
    ) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async createUser(userDTO: CreateUserDTO): Promise<UserResponseDTO> {
        const email = Email.create(userDTO.email);

        Password.create(userDTO.password);

        const existingUser = await this.userRepository.findByEmail(email.value);
        if (existingUser) {
            throw new BadRequestError('Email is already in use');
        }

        const hashedString = await this.passwordHasher.hash(userDTO.password);

        const hashedPasswordVO = Password.fromPersisted(hashedString);

        const domainUser = User.create(
            userDTO.name,
            email,
            hashedPasswordVO,
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

    async updateUser(userDTO: UpdateUserDTO): Promise<UserResponseDTO> {
        const id = userDTO.id;

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        let emailVO: Email | undefined = undefined;
        if (userDTO.email) {
            emailVO = Email.create(userDTO.email);
            if (emailVO.value !== existingUser.email.value) {
                const emailTaken = await this.userRepository.findByEmail(emailVO.value);
                if (emailTaken) {
                    throw new BadRequestError('Email is already in use by another account');
                }
            }
        }

        let passwordVO: Password | undefined = undefined;
        if (userDTO.password) {
            Password.create(userDTO.password);
            const hashedString = await this.passwordHasher.hash(userDTO.password);
            passwordVO = Password.fromPersisted(hashedString);
        }

        const userProps: Partial<UserProps> = {
            name: userDTO.name,
            email: emailVO,
            hashedPassword: passwordVO,
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