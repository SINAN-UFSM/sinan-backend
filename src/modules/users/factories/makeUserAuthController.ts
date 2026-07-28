import { UserAuthController } from '#modules/users/controllers/UserAuthController';
import { UserAuthService } from '#modules/users/services/UserAuthService';
import { DrizzleUserRepository } from '#modules/users/repositories/DrizzleUserRepository';
import { DrizzleRefreshTokenRepository } from '#modules/users/repositories/DrizzleRefreshTokenRepository';
import { BcryptPasswordHasher } from '#modules/users/services/BcryptPasswordHasher';

export const makeUserAuthController = (): UserAuthController => {
    const userAuthService = new UserAuthService(
        new DrizzleUserRepository(),
        new DrizzleRefreshTokenRepository(),
        new BcryptPasswordHasher()
    );
    const userAuthController = new UserAuthController(userAuthService);

    return userAuthController;
}