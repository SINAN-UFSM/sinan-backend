import { UserCrudController } from '#modules/users/controllers/UserCrudController';
import { UserCrudService } from '#modules/users/services/UserCrudService';
import { DrizzleUserRepository } from '#modules/users/repositories/DrizzleUserRepository';
import { BcryptPasswordHasher } from '#modules/users/services/BcryptPasswordHasher';

export const makeUserCrudController = (): UserCrudController => {
    const userRepository = new DrizzleUserRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const userService = new UserCrudService(userRepository, passwordHasher);
    const userController = new UserCrudController(userService);

    return userController;
};