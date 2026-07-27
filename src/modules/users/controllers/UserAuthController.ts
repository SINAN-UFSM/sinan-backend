import type { Request, Response, NextFunction } from 'express';
import type {
    UserAuthServicePort,
    LoginResponseDTO,
} from '#modules/users/ports/UserAuthServicePort';

import {
    loginSchema,
    refreshTokenSchema
} from '#modules/users/ports/UserAuthServicePort';

class UserAuthController {
    private userAuthService: UserAuthServicePort;

    constructor(userAuthService: UserAuthServicePort) {
        this.userAuthService = userAuthService;
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const requestData = loginSchema.parse(req.body);

            const response: LoginResponseDTO = await this.userAuthService.login(requestData);

            res.status(200).json(response);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Usando o schema importado!
            const { refresh } = refreshTokenSchema.parse(req.body);

            await this.userAuthService.logout(refresh);

            res.status(200).json({ message: 'Logged out successfully' });
            return;
        } catch (error: unknown) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refresh } = refreshTokenSchema.parse(req.body);

            const response: LoginResponseDTO = await this.userAuthService.refresh(refresh);

            res.status(200).json(response);
            return;
        } catch (error: unknown) {
            next(error);
        }
    }
}

export { UserAuthController };