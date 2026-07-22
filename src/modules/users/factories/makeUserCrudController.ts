import { UserCrudController } from '#modules/users/controllers/UserCrudController';
import { UserCrudService } from '#modules/users/services/UserCrudService';
import { DrizzleUserRepository } from '#modules/users/repositories/DrizzleUserRepository';

export const makeUserCrudController = (): UserCrudController => {
    const userRepository = new DrizzleUserRepository();
    const userService = new UserCrudService(userRepository);
    const userController = new UserCrudController(userService);

    return userController;
};