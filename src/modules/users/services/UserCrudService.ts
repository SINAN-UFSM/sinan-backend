import type { CreateUserDTO, UpdateUserDTO, UserCrudServicePort } from '#modules/users/ports/UserCrudServicePort';
import type { UserRepositoryPort } from '#modules/users/ports/UserRepositoryPort';

import { User } from "#modules/users/entities/User";

import { HashedPassword } from '../value-objects/HashedPassword.js';

class UserCrudService implements UserCrudServicePort {
    private userRepository: UserRepositoryPort;

    constructor(userRepository: UserRepositoryPort) {
        this.userRepository = userRepository;
    }

    async createUser(user: CreateUserDTO): Promise<User> {

        const hashedPassword = await HashedPassword.create(user.password);

        const domainUser = User.create(user.name, user.email, hashedPassword, user.role, user.unitId);
        const dbUser = await this.userRepository.save(domainUser);

        return dbUser;
    }

    async updateUser(id: string, user: UpdateUserDTO): Promise<User> {
        const updatedUser = await this.userRepository.update(id, user);

        return updatedUser;
    }
}

export { UserCrudService };