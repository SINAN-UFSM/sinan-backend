import { UserAuthController } from '#modules/users/controllers/UserAuthController';
import { UserAuthService } from '#modules/users/services/UserAuthService';
import { DrizzleUserRepository } from '#modules/users/repositories/DrizzleUserRepository';
import { DrizzleRefreshTokenRepository } from '#modules/users/repositories/DrizzleRefreshTokenRepository';

export const makeUserAuthController = (): UserAuthController => {
    const userAuthService = new UserAuthService(
        new DrizzleUserRepository(),
        new DrizzleRefreshTokenRepository(),
    );
    const userAuthController = new UserAuthController(userAuthService);

    return userAuthController;
}