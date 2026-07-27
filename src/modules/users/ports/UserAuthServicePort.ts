import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({ error: 'Invalid email format' }),
    password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
    refresh: z.string({ error: 'Refresh token is required' }).min(1, 'Refresh token cannot be empty')
});


type LoginRequestDTO = z.infer<typeof loginSchema>;

type RefreshTokenRequestDTO = z.infer<typeof refreshTokenSchema>;

type LoginResponseDTO = {
    token: string;
    refreshToken: string;
};

interface UserAuthServicePort {
    login(request: LoginRequestDTO): Promise<LoginResponseDTO>;
    logout(refreshToken: string): Promise<void>;
    refresh(oldRefreshToken: string): Promise<LoginResponseDTO>;
}

export type { LoginRequestDTO, LoginResponseDTO, RefreshTokenRequestDTO, UserAuthServicePort };