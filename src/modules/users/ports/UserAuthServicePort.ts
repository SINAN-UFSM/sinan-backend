type LoginRequestDTO = {
    email: string;
    password: string;
};

type LoginResponseDTO = {
    token: string;
    refreshToken: string;
};

interface UserAuthServicePort {
    login(request: LoginRequestDTO): Promise<LoginResponseDTO>;
    logout(refreshToken: string): Promise<void>;
    refresh(oldRefreshToken: string): Promise<LoginResponseDTO>;
}

export type { LoginRequestDTO, LoginResponseDTO, UserAuthServicePort };