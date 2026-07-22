import type { UserAuthServicePort, LoginRequestDTO, LoginResponseDTO } from '#modules/users/ports/UserAuthServicePort';
import type { Request, Response } from 'express';

class UserAuthController {
    private userAuthService: UserAuthServicePort;

    constructor(userAuthService: UserAuthServicePort) {
        this.userAuthService = userAuthService;
    }

    async login(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const request: LoginRequestDTO = {
                email: req.body.email,
                password: req.body.password
            };

            if (!request.email || !request.password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const response: LoginResponseDTO = await this.userAuthService.login(request);
            res.status(200).json(response);
            return;
        } catch (error: any) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const refreshToken = req.body.refresh;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            await this.userAuthService.logout(refreshToken);
            res.status(200).json({ message: 'Logged out successfully' });
            return;
        } catch (error: any) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: (error: any) => void): Promise<void> {
        try {
            const oldRefreshToken = req.body.refresh;

            if (!oldRefreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            const response: LoginResponseDTO = await this.userAuthService.refresh(oldRefreshToken);
            res.status(200).json(response);
            return
        } catch (error: any) {
            next(error);
        }
    }
}

export { UserAuthController }; 